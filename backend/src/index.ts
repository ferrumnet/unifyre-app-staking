import {
    LambdaGlobalContext, UnifyreBackendProxyModule,
    UnifyreBackendProxyService, KmsCryptor, AwsEnvs, SecretsProvider,
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
                },
                authRandomKey: getEnv('RANDOM_SECRET'),
                signingKeyHex: getEnv('REQUEST_SIGNING_KEY'),
                web3ProviderEthereum: getEnv('WEB3_PROVIDER_ETHEREUM'),
                web3ProviderRinkeby: getEnv('WEB3_PROVIDER_RINKEBY'),
                backend: getEnv('UNIFYRE_BACKEND'),
                region,
                cmkKeyArn: getEnv('CMK_KEY_ARN'),
                adminSecret: getEnv('ADMIN_SECRET')
            } as StakingAppConfig;
        }
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

        container.registerSingleton(EthereumSmartContractHelper,
            () => new EthereumSmartContractHelper(
                {
                    'ETHEREUM': stakingAppConfig.web3ProviderEthereum,
                    'RINKEBY': stakingAppConfig.web3ProviderRinkeby,
                } as Web3ProviderConfig
            ));
        container.registerSingleton(SmartContratClient,
            c => new SmartContratClient(c.get(EthereumSmartContractHelper),));
        container.register('JsonStorage', () => new Object());
        container.registerSingleton(StakingAppService,
                c => new StakingAppService(
                    () => c.get(UnifyreExtensionKitClient),
                    c.get(SmartContratClient),
                    ));

        container.registerSingleton('LambdaHttpHandler',
                c => new HttpHandler(
                    c.get(UnifyreBackendProxyService),
                    c.get(StakingAppService),
                    stakingAppConfig.adminSecret,
                    ));
        container.registerSingleton("LambdaSqsHandler",
            () => new Object());
        container.register(LoggerFactory,
            () => new LoggerFactory((name: string) => new ConsoleLogger(name)));
        await container.get<StakingAppService>(StakingAppService).init(stakingAppConfig.database);
    }
}