import { AnyAction, Dispatch } from "redux";
import { RootState } from "../../common/RootState";
import { StakingApp } from "../../common/Types";
import { StakingState, Utils } from "../../common/Utils";
import { addAction } from "../../common/Actions";
import { StakingAppServiceActions } from "../../services/StakingAppClient";
import { History } from 'history';

export interface StakingContractProps {
    balance: string;
    symbol: string;
    contract: StakingApp;
    stakedAmount: string;
    state: StakingState;
}

export interface StakingContractDispatch {
    onContractSelected: (history: History, address: string) => void;
}

function mapStateToProps(state: RootState): StakingContractProps {
    const userProfile = state.data.userData?.profile;
    const addr = userProfile?.accountGroups[0]?.addresses || {};
    const address = addr[0] || {};
    return {
        balance: address.balance,
        symbol: address.symbol,
        contract: state.data.stakingData.selectedContract || {} as any,
        stakedAmount: state.data.stakingData.userStake?.amountInStake || '',
        state: Utils.stakingState(state.data.stakingData.selectedContract),
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onContractSelected: (history, address) => {
        dispatch(addAction(StakingAppServiceActions.CONTRACT_SELECTED, {address}));
        history.push(`/unstake/?${address}`);
    }
} as StakingContractDispatch);

export const StakingContract = ({
    mapDispatchToProps,
    mapStateToProps,
});
