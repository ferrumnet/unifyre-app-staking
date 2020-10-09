import { AnyAction, Dispatch } from "redux";
import { IocModule, inject } from "../../common/IocModule";
import { addAction, CommonActions } from "../../common/Actions";
import { DashboardState, RootState } from "../../common/RootState";
import { intl } from "unifyre-react-helper";
import { StakingAppClient } from "../../services/StakingAppClient";
import { BackendMode, logError } from "../../common/Utils";
import { loadThemeForGroup } from "../../themeLoader";
import { CurrencyList } from "unifyre-extension-web3-retrofit";

export const DashboardActions = {
    INIT_FAILED: 'INIT_FAILED',
    INIT_SUCCEED: 'INIT_SUCCEED',
};

const Actions = DashboardActions;

export interface DashboardDispatch {
    onLoad: (groupId?: string) => Promise<void>;
 }

export interface DashboardProps extends DashboardState {
    customTheme: any;
    headerHtml?: string;
    footerHtml?: string;
}

function mapStateToProps(state: RootState): DashboardProps {
    return {
        ...state.ui.dashboard,
        customTheme: state.data.groupData.info.themeVariables,
        headerHtml: state.data.groupData.info.headerHtml,
        footerHtml: state.data.groupData.info.footerHtml,
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onLoad: async (groupId) => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const client = inject<StakingAppClient>(StakingAppClient);
            if (BackendMode.mode === 'unifyre') {
                const userProfile = await client.signInToServer(dispatch);
                if (!!userProfile) {
                    dispatch(addAction(Actions.INIT_SUCCEED, {}));
                } else {
                    dispatch(addAction(Actions.INIT_FAILED, { message: intl('fatal-error-details') }));
                }
            } else {
                if (!groupId) {
                    setTimeout(() => dispatch(addAction(Actions.INIT_FAILED, {message: 'No group ID'})));
                    return;
                }
                const groupInfo = await client.loadGroupInfo(dispatch, groupId!);
                if (!groupInfo) {
                    dispatch(addAction(Actions.INIT_FAILED, {message: 'No group info'}));
                    return;
                }
                const currencyList = inject<CurrencyList>(CurrencyList);
                currencyList.set([groupInfo.defaultCurrency]);
                loadThemeForGroup(groupInfo.themeVariables);
                await client.loadStakingsForToken(dispatch, groupInfo.defaultCurrency);
                dispatch(addAction(Actions.INIT_SUCCEED, {}));
            }
        } catch (e) {
            logError('Dashboard.mapDispatchToProps', e);
            dispatch(addAction(Actions.INIT_FAILED, { message: e.toString() }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
} as DashboardDispatch);

const defaultDashboardState = {
    initialized: false,
}

function reduce(state: DashboardState = defaultDashboardState, action: AnyAction) {    
    switch(action.type) {
        case Actions.INIT_FAILED:
            return {...state, initialized: false, fatalError: action.payload.message};
        case Actions.INIT_SUCCEED:
            return {...state, initialized: true, fatalError: undefined};
        default:
            return state;
    }
}

export const Dashboard = ({
    mapDispatchToProps,
    mapStateToProps,
    reduce
});