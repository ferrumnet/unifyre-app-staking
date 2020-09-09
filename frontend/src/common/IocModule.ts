import {Container, ValidationUtils, LoggerFactory, ConsoleLogger} from 'ferrum-plumbing';
import { IntlManager } from 'unifyre-react-helper';
import { stringsEn } from '../intl/en';
import { UserPreferenceService } from '../services/UserPreferenceService';
import { Dispatch, AnyAction } from 'redux';
import { StakingAppClient } from '../services/StakingAppClient';
import { UnifyreExtensionKitClient, ClientModule } from 'unifyre-extension-sdk';

class DummyStorage {}

interface Config {
    unifyreBackend: string;
    poolDropBackend: string;
    isProd: boolean;
}

const LOCAL_DEV_CONF = {
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
const NODE_ENV = 'production';// process.env.NODE_ENV;

export const CONFIG = NODE_ENV === 'production' ? PROD_CONF :
    (DEV_USES_LOCAL ? LOCAL_DEV_CONF : REMOTE_DEV_CONF);

export class IocModule {
    private static _container: Container;
    static async init(dispatch: Dispatch<AnyAction>) {
        if (!!IocModule._container) {
            return IocModule._container;
        }

        const c = new Container();
        c.register(LoggerFactory, () => new LoggerFactory(n => new ConsoleLogger(n)));
        c.register('JsonStorage', () => new DummyStorage());
        await c.registerModule(new ClientModule(CONFIG.unifyreBackend, 'STAKING'));
        c.registerSingleton(StakingAppClient, c => new StakingAppClient(c.get(UnifyreExtensionKitClient)));
        c.registerSingleton(UserPreferenceService, c => new UserPreferenceService());
        IntlManager.instance.load([stringsEn], 'en-US');
        IocModule._container = c;

        // init other dependencies
        c.get<UserPreferenceService>(UserPreferenceService).init(dispatch);
    }

    static container() {
        ValidationUtils.isTrue(!!IocModule._container, 'Container not initialized');
        return IocModule._container;
    }
}

export function inject<T>(type: any): T {
    return IocModule.container().get<T>(type);
}