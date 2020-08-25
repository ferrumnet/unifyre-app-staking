import { AnyAction, Dispatch } from "redux";
import { RootState } from "../../common/RootState";
import { StakingState, Utils } from "../../common/Utils";
import { StakingApp,UserStake } from "../../common/Types";
import { addAction } from "../../common/Actions";
import { StakingAppServiceActions } from "../../services/StakingAppClient";
import { History } from 'history';

export interface StakingContractProps {
    balance: string;
    symbol: string;
    contract: StakingApp;
    stakedAmount: string;
    state: StakingState;
    userStake: UserStake | undefined;
    //@ts-ignore
    styles?: any
}

export interface StakingContractDispatch {
    onContractSelected: (history: History, address: string,withdraw:boolean) => void;
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
        userStake: state?.data?.stakingData?.userStake
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onContractSelected: (history, address,withdraw) => {
        dispatch(addAction(StakingAppServiceActions.CONTRACT_SELECTED, {address}));
        if(withdraw){
            history.push(`/unstake/:${address}`);
        }else{
            history.push(`/stake/${address}`);
        }
    }
} as StakingContractDispatch);

export const StakingContract = ({
    mapDispatchToProps,
    mapStateToProps,
});
