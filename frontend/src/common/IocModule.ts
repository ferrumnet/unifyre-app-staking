import {Container, ValidationUtils, LoggerFactory, ConsoleLogger} from 'ferrum-plumbing';
import { IntlManager } from 'unifyre-react-helper';
import { stringsEn } from '../intl/en';
import { UserPreferenceService } from '../services/UserPreferenceService';
import { Dispatch, AnyAction } from 'redux';
import { StakingAppClient } from '../services/StakingAppClient';
import { UnifyreExtensionKitClient, ClientModule } from 'unifyre-extension-sdk';
import { BackendMode } from './Utils';
import { Web3RetrofitModule } from 'unifyre-extension-web3-retrofit/dist/Web3RetrofitModule';
import { StakingAppClientForWeb3 } from '../services/StakingAppClientForWeb3';
import { Integrations } from "@sentry/tracing";
import * as Sentry from "@sentry/browser";
import { Connect, CurrencyList, UnifyreExtensionWeb3Client } from 'unifyre-extension-web3-retrofit';
import { Web3ModalProvider } from 'unifyre-extension-web3-retrofit/dist/contract/Web3ModalProvider';
import { ConnectorContainer } from '../connect/ConnectContainer';
import { PairAddressService } from '../tokenBridge/PairAddressService';
import { PairAddressSignatureVerifyre } from '../tokenBridge/PairAddressSignatureVerifyer';
import { TokenBridgeClient } from '../tokenBridge/TokenBridgeClient';

class DummyStorage {}

interface Config {
    unifyreBackend: string;
    poolDropBackend: string;
    isProd: boolean;
}

const LOCAL_DEV_CONF = {
    // unifyreBackend: 'http://localhost:9000/api/',
    unifyreBackend: 'https://ube.ferrumnetwork.io/api/',
    poolDropBackend: 'http://localhost:8080',
    //poolDropBackend: 'http://da208211a392.ngrok.io',
    isProd: false,
} as Config;

const REMOTE_DEV_CONF = {
    unifyreBackend: 'https://tbe.ferrumnetwork.io/api/',
    poolDropBackend: 'https://y6sl343dn6.execute-api.us-east-2.amazonaws.com/default/prod-unifyre-extension-staking-backend',
    isProd: false,
} as Config;

const PROD_CONF = {
    unifyreBackend: 'https://ube.ferrumnetwork.io/api/',
    poolDropBackend: 'https://y6sl343dn6.execute-api.us-east-2.amazonaws.com/default/prod-unifyre-extension-staking-backend',
    isProd: true,
} as Config;

const DEV_USES_LOCAL: boolean = true;
const NODE_ENV = process.env.NODE_ENV;

// export const CONFIG = PROD_CONF;

export const CONFIG = NODE_ENV === 'production' ? PROD_CONF :
    (DEV_USES_LOCAL ? LOCAL_DEV_CONF : REMOTE_DEV_CONF);

export class IocModule {
    private static _container: Container;
    static async init(dispatch: Dispatch<AnyAction>) {
        if (!!IocModule._container) {
            return IocModule._container;
        }
        IocModule.setupSentry();

        const c = new Container();
        c.register(LoggerFactory, () => new LoggerFactory(n => new ConsoleLogger(n)));
        c.register('JsonStorage', () => new DummyStorage());
        await c.registerModule(new ClientModule(CONFIG.unifyreBackend, 'STAKING'));
        if (BackendMode.mode === 'unifyre') {
            c.registerSingleton(StakingAppClient,
                c => new StakingAppClient(c.get(UnifyreExtensionKitClient)));
        } else {
            await c.registerModule(new Web3RetrofitModule('STAKING', []));
            c.registerSingleton(StakingAppClient, c =>
                new StakingAppClientForWeb3(c.get(UnifyreExtensionKitClient)));
            c.registerSingleton(TokenBridgeClient, c => new TokenBridgeClient(
                    c.get(UnifyreExtensionKitClient),
                    CONFIG.poolDropBackend
                )
            );
            const client = c.get<StakingAppClient>(StakingAppClient);
            const providers = await client.loadHttpProviders(dispatch);
            c.registerSingleton('Web3ModalProvider', () => new Web3ModalProvider(providers));
        }

        c.registerSingleton(ConnectorContainer, c => new ConnectorContainer(
            c.get(UnifyreExtensionKitClient), c.get(Connect), c.get(CurrencyList), c.get('Web3ModalProvider')));

        c.registerSingleton(UserPreferenceService, () => new UserPreferenceService());
        IntlManager.instance.load([stringsEn], 'en-US');
        IocModule._container = c;

        // init other dependencies
        c.get<UserPreferenceService>(UserPreferenceService).init(dispatch);

        // PairAddressService
        c.registerSingleton(PairAddressService, c => new PairAddressService(
            c.get(UnifyreExtensionWeb3Client), c.get(Connect)));
        c.registerSingleton(PairAddressSignatureVerifyre, () => new PairAddressSignatureVerifyre());
    }

    static container() {
        ValidationUtils.isTrue(!!IocModule._container, 'Container not initialized');
        return IocModule._container;
    }

    private static setupSentry() {
        Sentry.init({
            dsn: 'https://b12178c8a471450a9aad6b44e1d6e660@o455885.ingest.sentry.io/5448142',
            integrations: [
              new Integrations.BrowserTracing(),
            ],
            release: "unifyre-app-staking@" + process.env.npm_package_version, // To set your release version
            tracesSampleRate: 0.1,
          });
    }
}

export function inject<T>(type: any): T {
    return IocModule.container().get<T>(type);
}
