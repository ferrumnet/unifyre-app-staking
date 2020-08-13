import {
    LambdaGlobalContext, MongooseConfig, UnifyreBackendProxyModule, UnifyreBackendProxyService, KmsCryptor, AwsEnvs, SecretsProvider,
} from 'aws-lambda-helper';
import {HttpHandler} from "./HttpHandler";
import {
    ConsoleLogger,
    Container,
    LoggerFactory, Module, EncryptedData,
} from "ferrum-plumbing";
import { ClientModule, UnifyreExtensionKitClient } from 'unifyre-extension-sdk';
import { getEnv } from './MongoTypes';
import { StakingAppService } from './StakingAppService';
import { SmartContratClient } from './SmartContractClient';
import { KMS } from 'aws-sdk';
import { StakingAppConfig } from './Types';

const global = { init: false };
const STAKING_APP_ID = 'STAKING_APP';

// DEV - only use for local. Remote dev is considered prod
const IS_DEV = true;
const STAKING_APP_SMART_CONTRACT_ADDRESS_DEV = '0xbaC16a35204d809b17EF3e5F47437F43e6360310';

const STAKING_APP_TOKEN_ADDRESS_DEV = '0x402a8e00603aB331d3F5Bf5632348E6EE66C6Fca';

const STAKING_APP_TOKEN_ADDRESS_PROD = '0x402a8e00603aB331d3F5Bf5632348E6EE66C6Fca';

const STAKING_APP_SMART_CONTRACT_ADDRESS_PROD = {
 
};

const STAKING_APP_ADDRESS = IS_DEV ?
    { 'ETHEREUM': STAKING_APP_SMART_CONTRACT_ADDRESS_DEV } : STAKING_APP_SMART_CONTRACT_ADDRESS_PROD;

const STAKING_TOKEN_ADDRESS = IS_DEV ? STAKING_APP_TOKEN_ADDRESS_DEV : STAKING_APP_TOKEN_ADDRESS_PROD;

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
        // Only uncomment to encrypt sk
        // await encryptEnv('SK', container);

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

        container.registerSingleton(SmartContratClient,
            () => new SmartContratClient(
                stakingAppConfig.web3ProviderEthereum,
                stakingAppConfig.web3ProviderRinkeby,
                STAKING_APP_ADDRESS,
                STAKING_TOKEN_ADDRESS));
        container.register('JsonStorage', () => new Object());
        container.registerSingleton(StakingAppService,
                c => new StakingAppService(
                    () => c.get(UnifyreExtensionKitClient),
                    c.get(SmartContratClient),
                    ));

        container.registerSingleton('LambdaHttpHandler',
                c => new HttpHandler(c.get(UnifyreBackendProxyService), c.get(StakingAppService)));
        container.registerSingleton("LambdaSqsHandler",
            () => new Object());
        container.register(LoggerFactory,
            () => new LoggerFactory((name: string) => new ConsoleLogger(name)));
        await container.get<StakingAppService>(StakingAppService).init(stakingAppConfig.database);
    }
}

async function encryptEnv(env: string, c: Container) {
    // Run this once on the lambda function to print out the encrypted private key
    // then use this encrypted private key as the app parameter going forward
    // and discard the plain text private key.
    const sk = getEnv(env);
    const cmkKeyArn = getEnv('CMK_KEY_ARN');
    c.register('KMS', () => new KMS({region: 'us-east-2'}));
    c.register(KmsCryptor, _c => new KmsCryptor(_c.get('KMS'),
        cmkKeyArn));
    const enc = await c.get<KmsCryptor>(KmsCryptor).encryptHex(sk);
    console.log('ENCRYPTED');
    console.log(enc);
    throw new Error('DEV ONLY');
}