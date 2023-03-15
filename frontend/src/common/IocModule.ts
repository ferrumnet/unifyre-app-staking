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

class DummyStorage {}

interface Config {
    unifyreBackend: string;
    poolDropBackend: string;
    isProd: boolean;
}

const LOCAL_DEV_CONF = {
    // unifyreBackend: 'http://localhost:9000/api/',
    unifyreBackend: 'https://ube.ferrumnetwork.io/api/',
    poolDropBackend: 'https://r87ukhl9q2.execute-api.us-east-2.amazonaws.com/default/updated-staking-backend-dev',
    //poolDropBackend: 'http://da208211a392.ngrok.io',
    //'https://r87ukhl9q2.execute-api.us-east-2.amazonaws.com/default/updated-staking-backend-dev'
    isProd: false,
} as Config;

const REMOTE_DEV_CONF = {
    unifyreBackend: 'https://tbe.ferrumnetwork.io/api/',
    poolDropBackend: 'https://y6sl343dn6.execute-api.us-east-2.amazonaws.com/default/prod-unifyre-extension-staking-backend',
    isProd: false,
} as Config;

const PROD_CONF = {
    unifyreBackend: 'https://ube.ferrumnetwork.io/api/',
    poolDropBackend: 'https://r87ukhl9q2.execute-api.us-east-2.amazonaws.com/default/updated-staking-backend-dev',
    isProd: true,
} as Config;

const DEV_USES_LOCAL: boolean = true;
const NODE_ENV = process.env.NODE_ENV;

const STAGING_PREFIXES = ['dev','qa','uat','staging','prod'];

const url = () =>{

    // @ts-ignore
	const base = (window.location?.origin || '').toLowerCase();

    const prefix = STAGING_PREFIXES.find(p => base.includes(`-${p}`||`https://${p}`));

    if (prefix) {
        console.log(prefix,'current-prefix')
        return prefix;
    }
}
// export const CONFIG = PROD_CONF;

export const CONFIG = url() === 'prod' ? PROD_CONF 
                    : url() === 'dev' ? LOCAL_DEV_CONF 
                    : url() === 'staging' ? LOCAL_DEV_CONF 
                    : (DEV_USES_LOCAL ? LOCAL_DEV_CONF : REMOTE_DEV_CONF);

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
        console.log(BackendMode.mode,'BackendModeBackendModeBackendMode')
        if (BackendMode.mode === 'unifyre') {
            c.registerSingleton(StakingAppClient,
                c => new StakingAppClient(c.get(UnifyreExtensionKitClient),c.get(UnifyreExtensionWeb3Client)));
        } else {
            c.registerSingleton('Web3ModalProvider', () => new Web3ModalProvider(providers));
            await c.registerModule(new Web3RetrofitModule('STAKING', []));
            c.registerSingleton(StakingAppClient, c =>
                new StakingAppClient(c.get(UnifyreExtensionKitClient),c.get(UnifyreExtensionWeb3Client)));
            c.registerSingleton(StakingAppClientForWeb3, c =>
                new StakingAppClientForWeb3(c.get(UnifyreExtensionKitClient),c.get(UnifyreExtensionWeb3Client)));
            const client = c.get<StakingAppClient>(StakingAppClient);
            const providers = await client.loadHttpProviders(dispatch);
        }

        c.registerSingleton(ConnectorContainer, c => new ConnectorContainer());

        c.registerSingleton(UserPreferenceService, () => new UserPreferenceService());
        IntlManager.instance.load([stringsEn], 'en-US');
        IocModule._container = c;

        // init other dependencies
        c.get<UserPreferenceService>(UserPreferenceService).init(dispatch);


        await c.registerModule(new Web3RetrofitModule('BASE', []));

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
