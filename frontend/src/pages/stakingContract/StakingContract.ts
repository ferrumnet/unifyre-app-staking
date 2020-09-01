import { AnyAction, Dispatch } from "redux";
import { RootState } from "../../common/RootState";
import { formatter, StakingState, Utils } from "../../common/Utils";
import { StakingApp,UserStake } from "../../common/Types";
import { addAction } from "../../common/Actions";
import { StakingAppServiceActions } from "../../services/StakingAppClient";
import { History } from 'history';
import { Big } from 'big.js';

export interface StakingContractProps {
    balance: string;
    symbol: string;
    contract: StakingApp;
    stakedAmount: string;
    state: StakingState;
    userStake: UserStake | undefined;
    stakeCompletionRate: number;
    remaining: string;
    rewardPercent: string;
    earlyWithdrawPercent: string;
    stakingTimeProgress: number;
    maturityProgress: number;
    unstakeRewardsNow: string;
    unstakeRewardsMaturity: string;
    filled: boolean;
}

export interface StakingContractDispatch {
    onContractSelected: (history: History, address: string,withdraw:boolean) => void;
}

function mapStateToProps(state: RootState): StakingContractProps {
    const userProfile = state.data.userData?.profile;
    const addr = userProfile?.accountGroups[0]?.addresses || {};
    const address = addr[0] || {};
    const contract = state.data.stakingData.selectedContract || {} as any as StakingApp;
    const rewards = Utils.stakingRewards(contract);
    const stakeOf = state?.data?.stakingData?.userStake || {} as any as UserStake;
    const totB = new Big(contract.stakedTotal || '0');
    const capB = new Big(contract.stakingCap || '0');
    return {
        balance: address.balance,
        symbol: address.symbol,
        contract,
        stakedAmount: state.data.stakingData.userStake?.amountInStake || '',
        state: Utils.stakingState(contract),
        userStake: stakeOf,
        stakeCompletionRate: capB.gt(new Big(0)) ?
            Number(totB.times(new Big(100)).div(capB).toFixed()) : 0,
        remaining: formatter.format(new Big(contract.stakingCap || '0').minus(new Big(contract.stakedTotal || '0')).toFixed(0), true)!,
        rewardPercent: formatter.format(rewards.maturityAnnual, true) || '0',
        earlyWithdrawPercent: formatter.format(rewards.earlyWithdrawAnnual, true) || '0',
        stakingTimeProgress: Utils.stakeProgress(contract),
        maturityProgress: !contract.withdrawEnds ? 0 : 
            (Date.now() / 1000 - contract.stakingEnds) / (contract.withdrawEnds - contract.stakingEnds),
        unstakeRewardsNow: Utils.unstakeRewardsAt(contract, stakeOf.amountInStake, Date.now()),
        unstakeRewardsMaturity: Utils.unstakeRewardsAt(contract, stakeOf.amountInStake, contract.withdrawEnds * 1000 + 1),
        filled: capB.minus(totB).lte(new Big(0)),
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onContractSelected: (history, address,withdraw) => {
        dispatch(addAction(StakingAppServiceActions.CONTRACT_SELECTED, {address}));
        if(withdraw){
            history.push(`/unstake/${address}`);
        }else{
            history.push(`/stake/${address}`);
        }
    }
} as StakingContractDispatch);

export const StakingContract = ({
    mapDispatchToProps,
    mapStateToProps,
});
