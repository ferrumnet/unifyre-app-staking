import { AnyAction, Dispatch } from "redux";
import { DashboardState, RootState } from "../../../common/RootState";
import { inject, IocModule } from '../../../common/IocModule';
import { addAction, CommonActions } from "../../../common/Actions";
import { TokenBridgeClient } from "../../TokenBridgeClient";
import { ReponsivePageWrapperDispatch } from "../../../base/PageWrapperTypes";
import { logError } from "../../../common/Utils";

export const DashboardActions = {
    INIT_FAILED: 'INIT_FAILED',
    INIT_SUCCEED: 'INIT_SUCCEED',
    CLEAR_ERROR: 'CLEAR_ERROR',
    ERROR_OCCURED: 'ERROR_OCCURED'
};

const Actions = DashboardActions;

export interface DashboardDispatch extends ReponsivePageWrapperDispatch {
    onBridgeLoad: () => Promise<void>;
    onClear: () => void;
    onError: (v:string) => void;
}

export interface DashboardProps extends DashboardState {
    initialized: boolean
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onBridgeLoad: async () => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            dispatch(addAction(Actions.INIT_SUCCEED, {}));
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
    return {
        ...state.ui.dashboard,
        initialized: state.ui.dashboard.initialized,
        fatalError: state.ui.dashboard.fatalError,
        error: state.ui.dashboard.error
    }
}

const defaultDashboardState = {
    initialized: false,
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
        default:
            return state;
    }
}

export const Dashboard = ({
    mapDispatchToProps,
    mapStateToProps,
    reduce
});
