import { AnyAction, Dispatch } from "redux";
import { DashboardState, RootState } from "../../../common/RootState";
import { inject, IocModule } from '../../../common/IocModule';
import { addAction, CommonActions } from "../../../common/Actions";
import { TokenBridgeClient } from "../../TokenBridgeClient";
import { ReponsivePageWrapperDispatch } from "../../../base/PageWrapperTypes";
import { logError, Utils } from "../../../common/Utils";
import { LiquidityActions } from './../swap/swap';
import {loadThemeForGroup} from './../../../themeLoader';
export const DashboardActions = {
    INIT_FAILED: 'INIT_FAILED',
    INIT_SUCCEED: 'INIT_SUCCEED',
    CLEAR_ERROR: 'CLEAR_ERROR',
    ERROR_OCCURED: 'ERROR_OCCURED',
};

const Actions = DashboardActions;

export interface DashboardDispatch extends ReponsivePageWrapperDispatch {
    onBridgeLoad: () => Promise<void>;
    onClear: () => void;
    onError: (v:string) => void;
}

export interface DashboardProps extends DashboardState {
    initialized: boolean,
    isHome: boolean,
    isPaired: boolean,
    initialised:boolean,
    connected: boolean,
    customTheme?: any;
    userWithdrawalItems: any[]
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onBridgeLoad: async () => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);
            const groupId = Utils.getGroupIdFromHref();
            if (!groupId) {
                setTimeout(() => dispatch(addAction(Actions.INIT_FAILED, {message: 'No group ID'})));
                return;
            }
            const groupInfo = await sc.loadGroupInfo(dispatch, groupId!);
            if (!groupInfo) {
                dispatch(addAction(Actions.INIT_FAILED, {message: 'No group info'}));
                return;
            }else{
                loadThemeForGroup(groupInfo.themeVariables);
                dispatch(addAction(Actions.INIT_SUCCEED, {}));
                return;
            }
        } catch (error) {
            logError('Dashboard.mapDispatchToProps', error);
            dispatch(addAction(Actions.INIT_FAILED, { message: error.toString() }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    onConnected: async () => {
        try {
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);
            const res = await sc.signInToServer(dispatch);
            dispatch(addAction(Actions.CLEAR_ERROR,{}));
            return !!res;
        } catch(e) {
            throw e;
        }
    },
    onClear: async () => dispatch(addAction(Actions.CLEAR_ERROR,{})),
    onError: (error: string) => {
         
    },
    onConnectionFailed: (e: Error) => {
    },
    onDisconnected: () => {

    },
});

function mapStateToProps (state: RootState):DashboardProps {
    const userProfile = state.data.userData?.profile;
    const addr = userProfile?.accountGroups[0]?.addresses || {};
    const address = addr[0] || {};
    return {
        ...state.ui.dashboard,
        initialized: state.ui.dashboard.initialized,
        fatalError: state.ui.dashboard.fatalError,
        error: state.ui.dashboard.error,
        isHome: state.ui.dashboard.isHome || false,
        initialised: state.ui.bridgeMain.initialised,
        isPaired: state.ui.bridgeMain.isPaired,
        connected: address.network ? true : false,
        userWithdrawalItems: state.ui.swap.userWithdrawalItems || []
    }
}

const defaultDashboardState = {
    initialized: false,
    userWithdrawalItems: []
}

function reduce(state: DashboardState = defaultDashboardState, action: AnyAction){
    switch(action.type) {
        case Actions.INIT_FAILED:
            return {...state, initialized: false, fatalError: action.payload.message};
        case Actions.INIT_SUCCEED:
            return {...state, initialized: true, fatalError: undefined,error: undefined};
        case Actions.CLEAR_ERROR:
            return {...state, error: undefined};
        case Actions.ERROR_OCCURED:
            return {...state, fatalError: action.payload.message,error: 'hrty'};
        case LiquidityActions.WITHDRAWAL_ITEMS_FETCHED:
            return {...state, userWithdrawalItems: action.payload.items}
        default:
            return state;
    }
}

export const Dashboard = ({
    mapDispatchToProps,
    mapStateToProps,
    reduce
});
