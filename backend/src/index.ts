import {
    LambdaGlobalContext, UnifyreBackendProxyModule,
    UnifyreBackendProxyService, KmsCryptor, AwsEnvs, SecretsProvider, MongooseConfig,
} from 'aws-lambda-helper';
import {HttpHandler} from "./HttpHandler";
import {
    ConsoleLogger,
    Container,
    LoggerFactory, Module,
} from "ferrum-plumbing";
import { ClientModule, UnifyreExtensionKitClient } from 'unifyre-extension-sdk';
import { getEnv } from './MongoTypes';
import { StakingAppService } from './StakingAppService';
import { SmartContratClient } from './SmartContractClient';
import { KMS } from 'aws-sdk';
import { StakingAppConfig } from './Types';
import { EthereumSmartContractHelper, Web3ProviderConfig } from 'aws-lambda-helper/dist/blockchain';
import { StakingFarmContractClient } from './StakingFarmContractClient';
import { TokenBridgeHttpHandler } from './tokenBridge/TokenBridgeHttpHandler';
import {BridgeConfigStorage} from './tokenBridge/processor/BridgeConfigStorage';
import { TokenBridgeService } from './tokenBridge/TokenBridgeService';
import { TokenBridgeContractClinet } from './tokenBridge/TokenBridgeContractClient';
import { PairAddressSignatureVerifyre } from './tokenBridge/common/PairAddressSignatureVerifyer';

const global = { init: false };
const STAKING_APP_ID = 'STAKING';

async function init() {
    if (global.init) {
        return LambdaGlobalContext.container();
    }
    const container = await LambdaGlobalContext.container();
    await container.registerModule(new stakingAppModule());
    global.init = true;
    return container;
}

// Once registered this is the handler code for lambda_template
export async function handler(event: any, context: any) {
    try {
        const container = await init();
        const lgc = container.get<LambdaGlobalContext>(LambdaGlobalContext);
        return await lgc.handleAsync(event, context);
    } catch (e) {
        console.error(e);
        return {
            body: e.message,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Accept-Encoding, Accept-Language, Authorization, Host',
            },
            isBase64Encoded: false,
            statusCode: 500,
        }
    }
}

export class stakingAppModule implements Module {
    async configAsync(container: Container) {
        const region = process.env.AWS_REGION || process.env[AwsEnvs.AWS_DEFAULT_REGION] || 'us-east-2';
        const stakingAppConfArn = process.env[AwsEnvs.AWS_SECRET_ARN_PREFIX + 'UNI_APP_STAKING_APP'];
        let stakingAppConfig: StakingAppConfig = {} as any;
        if (stakingAppConfArn) {
            stakingAppConfig = await new SecretsProvider(region, stakingAppConfArn).get();
        } else {
            stakingAppConfig = {
                database: {
                    connectionString: getEnv('MONGOOSE_CONNECTION_STRING'),
                } as MongooseConfig,
                authRandomKey: getEnv('RANDOM_SECRET'),
                signingKeyHex: getEnv('REQUEST_SIGNING_KEY'),
                web3ProviderEthereum: getEnv('WEB3_PROVIDER_ETHEREUM'),
                web3ProviderRinkeby: getEnv('WEB3_PROVIDER_RINKEBY'),
                web3ProviderBsc: getEnv('WEB3_PROVIDER_BSC'),
                web3ProviderBscTestnet: getEnv('WEB3_PROVIDER_BSC_TESTNET'),
                web3ProviderPolygon: getEnv('WEB3_PROVIDER_POLYGON'),
                backend: getEnv('UNIFYRE_BACKEND'),
                region,
                cmkKeyArn: getEnv('CMK_KEY_ARN'),
                adminSecret: getEnv('ADMIN_SECRET'),
                bridgeConfig: {
                    contractClient: {
                        'ETHEREUM': getEnv('TOKEN_BRDIGE_CONTRACT_ETHEREUM'),
                        'RINKEBY': getEnv('TOKEN_BRDIGE_CONTRACT_RINKEBY'),
                        'BSC': getEnv('TOKEN_BRDIGE_CONTRACT_BSC_TESTNET'),
                        'BSC_TESTNET': getEnv('TOKEN_BRDIGE_CONTRACT_BSC_TESTNET'),
                    }
                }
            } as StakingAppConfig;
        }

        console.log(stakingAppConfig,'appconfig');
        // makeInjectable('CloudWatch', CloudWatch);
        // container.register('MetricsUploader', c =>
        //     new CloudWatchClient(c.get('CloudWatch'), 'WalletAddressManager', [
        //         { Name:'Application', Value: 'WalletAddressManager' } as Dimension,
        //     ]));
        // container.registerSingleton(MetricsService, c => new MetricsService(
        //   new MetricsAggregator(),
        //   { period: 3 * 60 * 1000 } as MetricsServiceConfig,
        //   c.get('MetricsUploader'),
        //   c.get(LoggerFactory),
        // ));

        // This will register sdk modules. Good for client-side, for server-side we also need the next
        // step
        await container.registerModule(new ClientModule(stakingAppConfig.backend, STAKING_APP_ID));
        
        // Decrypt the signing key
        let signingKeyHex = stakingAppConfig.signingKeyHex;
        if (stakingAppConfig.signingKey) { // For prod only
            container.register('KMS', () => new KMS({region: stakingAppConfig.region}));
            container.register(KmsCryptor, c => new KmsCryptor(c.get('KMS'),
            stakingAppConfig.cmkKeyArn));
            const jsonKey = stakingAppConfig.signingKey!;
            signingKeyHex = await container.get<KmsCryptor>(KmsCryptor).decryptToHex(jsonKey);
        }

        // Note: we register UnifyreBackendProxyModule for the backend applications
        // this will ensure that the ExtensionClient does not cache the token between different
        // requests, and also it will ensure that client will sign the requests using sigining_key.
        await container.registerModule(
            new UnifyreBackendProxyModule(STAKING_APP_ID, stakingAppConfig.authRandomKey,
                signingKeyHex!,));

        const networkProviders = {
                    'ETHEREUM': stakingAppConfig.web3ProviderEthereum,
                    'RINKEBY': stakingAppConfig.web3ProviderRinkeby,
                    'BSC': stakingAppConfig.web3ProviderBsc,
                    'BSC_TESTNET': stakingAppConfig.web3ProviderBscTestnet,
                    'POLYGON': stakingAppConfig.web3ProviderPolygon,
                } as Web3ProviderConfig;
        container.registerSingleton(EthereumSmartContractHelper,
            () => new EthereumSmartContractHelper(networkProviders));
        container.registerSingleton(SmartContratClient,
            c => new SmartContratClient(c.get(EthereumSmartContractHelper),));
        container.registerSingleton(SmartContratClient,
            c => new SmartContratClient(c.get(EthereumSmartContractHelper),));
        container.registerSingleton(
            StakingFarmContractClient,
            c=> new StakingFarmContractClient(
                c.get(EthereumSmartContractHelper) 
            )
        )
        container.register('JsonStorage', () => new Object());
        container.registerSingleton(StakingAppService,
                c => new StakingAppService(
                    () => c.get(UnifyreExtensionKitClient),
                    c.get(SmartContratClient),
                    c.get(StakingFarmContractClient),
                    ));
        container.registerSingleton(BridgeConfigStorage,c=>new BridgeConfigStorage())
        container.register(TokenBridgeHttpHandler,
                c=> new TokenBridgeHttpHandler(
                    c.get(EthereumSmartContractHelper),
                    c.get(TokenBridgeService),
                    c.get(BridgeConfigStorage),
                )
        );
        container.registerSingleton('LambdaHttpHandler',
                c => new HttpHandler(
                    c.get(UnifyreBackendProxyService),
                    c.get(StakingAppService),
                    stakingAppConfig.adminSecret,
                    stakingAppConfig.authRandomKey,
                    networkProviders,
                    c.get(TokenBridgeHttpHandler)
                    ));
        container.registerSingleton("LambdaSqsHandler",
            () => new Object());
        container.register(LoggerFactory,
            () => new LoggerFactory((name: string) => new ConsoleLogger(name)));
        container.registerSingleton(TokenBridgeHttpHandler,
            c => new TokenBridgeHttpHandler(c.get(EthereumSmartContractHelper),c.get(TokenBridgeService),c.get(BridgeConfigStorage)))
        container.registerSingleton(PairAddressSignatureVerifyre, c=>
            new PairAddressSignatureVerifyre()
        ),
        container.registerSingleton(TokenBridgeService,
            c => new TokenBridgeService(c.get(EthereumSmartContractHelper),
                c.get(TokenBridgeContractClinet),
                c.get(PairAddressSignatureVerifyre),
            ));
        container.registerSingleton(TokenBridgeContractClinet, c => new TokenBridgeContractClinet(
            c.get(EthereumSmartContractHelper), stakingAppConfig.bridgeConfig?.contractClient,
        ));
        await container.get<TokenBridgeService>(TokenBridgeService).init(stakingAppConfig.database);
        await container.get<StakingAppService>(StakingAppService).init(stakingAppConfig.database);
        await container.get<BridgeConfigStorage>(BridgeConfigStorage).init(stakingAppConfig.database);

        // Paired address
        container.register(PairAddressSignatureVerifyre, () => new PairAddressSignatureVerifyre());
    }
}