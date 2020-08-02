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
import { PoolDropService } from './StakingAppService';
import { SmartContratClient } from './SmartContractClient';
import { KMS } from 'aws-sdk';
import { PoolDropConfig } from './Types';

const global = { init: false };
const POOLDROP_APP_ID = 'POOL_DROP';

// DEV - only use for local. Remote dev is considered prod
const IS_DEV = !!process.env.IS_DEV;
const POOL_DROP_SMART_CONTRACT_ADDRESS_DEV = '0x32d7c376594bb287a252ffba01e70ad56174702a';

const POOL_DROP_SMART_CONTRACT_ADDRESS_PROD = {
    'ETHEREUM': '0x953816f333952f2132f132df8edd9b703582b30f',
    'RINKEBY': '0xcc33f44fff89c369d9e770186a018243522fe220'
};
const POOL_DROP_ADDRESS = IS_DEV ?
    { 'ETHEREUM': POOL_DROP_SMART_CONTRACT_ADDRESS_DEV } : POOL_DROP_SMART_CONTRACT_ADDRESS_PROD;

async function init() {
    if (global.init) {
        return LambdaGlobalContext.container();
    }
    const container = await LambdaGlobalContext.container();
    await container.registerModule(new PoolDropModule());
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

export class PoolDropModule implements Module {
    async configAsync(container: Container) {
        // Only uncomment to encrypt sk
        // await encryptEnv('SK', container);

        const region = process.env.AWS_REGION || process.env[AwsEnvs.AWS_DEFAULT_REGION] || 'us-east-2';
        const poolDropConfArn = process.env[AwsEnvs.AWS_SECRET_ARN_PREFIX + 'UNI_APP_POOL_DROP'];
        let poolDropConfig: PoolDropConfig = {} as any;
        if (poolDropConfArn) {
            poolDropConfig = await new SecretsProvider(region, poolDropConfArn).get();
        } else {
            poolDropConfig = {
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
            } as PoolDropConfig;
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
        await container.registerModule(new ClientModule(poolDropConfig.backend, POOLDROP_APP_ID));
        
        // Decrypt the signing key
        let signingKeyHex = poolDropConfig.signingKeyHex;
        if (poolDropConfig.signingKey) { // For prod only
            container.register('KMS', () => new KMS({region: poolDropConfig.region}));
            container.register(KmsCryptor, c => new KmsCryptor(c.get('KMS'),
                poolDropConfig.cmkKeyArn));
            const jsonKey = poolDropConfig.signingKey!;
            signingKeyHex = await container.get<KmsCryptor>(KmsCryptor).decryptToHex(jsonKey);
        }


        // Note: we register UnifyreBackendProxyModule for the backend applications
        // this will ensure that the ExtensionClient does not cache the token between different
        // requests, and also it will ensure that client will sign the requests using sigining_key.
        await container.registerModule(
            new UnifyreBackendProxyModule(POOLDROP_APP_ID, poolDropConfig.authRandomKey,
                signingKeyHex!,));

        container.registerSingleton(SmartContratClient,
            () => new SmartContratClient(
                poolDropConfig.web3ProviderEthereum,
                poolDropConfig.web3ProviderRinkeby,
                POOL_DROP_ADDRESS));
        container.register('JsonStorage', () => new Object());
        container.registerSingleton(PoolDropService,
                c => new PoolDropService(
                    () => c.get(UnifyreExtensionKitClient),
                    c.get(SmartContratClient),
                    ));

        container.registerSingleton('LambdaHttpHandler',
                c => new HttpHandler(c.get(UnifyreBackendProxyService), c.get(PoolDropService)));
        container.registerSingleton("LambdaSqsHandler",
            () => new Object());
        container.register(LoggerFactory,
            () => new LoggerFactory((name: string) => new ConsoleLogger(name)));
        await container.get<PoolDropService>(PoolDropService).init(poolDropConfig.database);
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