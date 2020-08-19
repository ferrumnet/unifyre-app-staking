import { AnyAction, Dispatch } from "redux";
import { IocModule, inject } from "../../common/IocModule";
import { addAction, CommonActions } from "../../common/Actions";
import { RootState, DashboardProps } from "../../common/RootState";
import { intl } from "unifyre-react-helper";
import { StakingAppClient } from "../../services/StakingAppClient";

const DashboardActions = {
    INIT_FAILED: 'INIT_FAILED',
    INIT_SUCCEED: 'INIT_SUCCEED',
};

const Actions = DashboardActions;

export interface DashboardDispatch {
    onLoad: () => Promise<void>;
 }

function mapStateToProps(state: RootState): DashboardProps {
    return {
        ...state.ui.dashboard,
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onLoad: async () => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const wyre = inject<StakingAppClient>(StakingAppClient);
            const data = await wyre.signInToServer(dispatch);
            if (data?.userProfile) {
                if(!data['stakingData']){
                    dispatch(addAction(Actions.INIT_FAILED, { error: 'Staking for selected token is yet to start.' }));
                    return
                }
                dispatch(addAction(Actions.INIT_SUCCEED, {"stakingData": data['stakingData']}));
            } else {
                dispatch(addAction(Actions.INIT_FAILED, { error: intl('fatal-error-details') }));
            }
        } catch (e) {
            console.error('Dashboard.mapDispatchToProps', e);
            dispatch(addAction(Actions.INIT_FAILED, { error: e.toString() }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    }
} as DashboardDispatch);

const defaultStakingCreateState = {
    initialized: false,
    amount: '0'
}

function reduce(state: DashboardProps = defaultStakingCreateState, action: AnyAction) {    
    switch(action.type) {
        case Actions.INIT_FAILED:
            return {...state, initialized: false, fatalError: action.payload.error};
        case Actions.INIT_SUCCEED:
            return {...state, initialized: true, fatalError: undefined, stakingData: action.payload.stakingData};
        default:
        return state;
    }
}

export const Dashboard = ({
    mapDispatchToProps,
    mapStateToProps,
    reduce
});