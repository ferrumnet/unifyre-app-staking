import { AnyAction, Dispatch } from "redux";
import { RootState } from "../../common/RootState";
import { StakingApp } from "../../common/Types";
import { History } from 'history';
import { addAction } from "../../common/Actions";
import { StakingAppServiceActions } from "../../services/StakingAppClient";

export interface MainProps {
    symbol: string;
    stakings: StakingApp[];
}

export interface MainDispatch {
    onContractSelected: (history: History, address: string) => void;
}

function mapStateToProps(state: RootState): MainProps {
    const userProfile = state.data.userData?.profile;
    const addr = userProfile?.accountGroups[0]?.addresses || {};
    const address = addr[0] || {};
    return {
        symbol: address.symbol,
        stakings: state.data.stakingData.contracts,
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onContractSelected: (history, address) => {
        dispatch(addAction(StakingAppServiceActions.CONTRACT_SELECTED, {address}));
        history.push('/info');
    }
} as MainDispatch);

export const Main = ({
    mapDispatchToProps,
    mapStateToProps,
});