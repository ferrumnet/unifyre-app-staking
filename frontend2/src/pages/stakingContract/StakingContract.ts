import { AnyAction, Dispatch } from "redux";
import { RootState } from "../../common/RootState";
import { formatter, StakingState, Utils } from "../../common/Utils";
import { StakingApp,UserStake } from "../../common/Types";
import { addAction } from "../../common/Actions";
import { StakingAppServiceActions } from "../../services/StakingAppClient";
import { History } from 'history';
import { Big } from 'big.js';
import { LocaleManager } from "unifyre-react-helper";

export interface StakingContractProps {
    userAddress: string;
    balance: string;
    symbol: string;
    contract: StakingApp;
    stakedAmount: string;
    state: StakingState;
    userStake: UserStake | undefined;
    stakeCompletionRate: number;
    remaining: string;
    rewardSentence: string;
    earlyWithdrawSentence: string;
    stakingTimeProgress: number;
    maturityProgress: number;
    unstakeRewardsNow: string;
    unstakeRewardsMaturity: string;
    filled: boolean;
    groupId?: string;
    isZeroReward: boolean;
}

export interface StakingContractDispatch {
    onContractSelected: (history: History, network: string, address: string, withdraw:boolean, groupId?: string) => void;
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
        userAddress: address.humanReadableAddress || address.address,
        balance: address.balance,
        symbol: address.symbol,
        contract,
        stakedAmount: state.data.stakingData.userStake?.amountInStake || '',
        state: Utils.stakingState(contract),
        userStake: stakeOf,
        stakeCompletionRate: capB.gt(new Big(0)) ?
            Number(totB.times(new Big(100)).div(capB).toFixed()) : 0,
        remaining: formatter.format(new Big(contract.stakingCap || '0').minus(new Big(contract.stakedTotal || '0')).toFixed(0), true)!,
        rewardSentence: Utils.rewardSentence(rewards.maturityAnnual, rewards),
        earlyWithdrawSentence: Utils.rewardSentence(rewards.earlyWithdrawAnnual, rewards),
        stakingTimeProgress: Utils.stakeProgress(contract),
        maturityProgress: !contract.withdrawEnds ? 0 : 
            (Math.min(Date.now() / 1000, contract.withdrawEnds) - contract.stakingEnds) / (contract.withdrawEnds - contract.stakingEnds),
        unstakeRewardsNow: `${LocaleManager.formatDecimalString(
            Utils.unstakeRewardsAt(contract, stakeOf.amountInStake, Date.now()))} ${contract.rewardSymbol || contract.symbol || ''}`,
        unstakeRewardsMaturity: `${LocaleManager.formatDecimalString(
            Utils.unstakeRewardsAt(contract, stakeOf.amountInStake, contract.withdrawEnds * 1000 + 1))} ${contract.rewardSymbol || contract.symbol || ''}`,
        filled: capB.minus(totB).lte(new Big(0)),
        groupId: state.data.groupData.info.groupId,
        isZeroReward: contract.totalReward == '0',
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onContractSelected: (history, network, address,withdraw, groupId) => {
        dispatch(addAction(StakingAppServiceActions.CONTRACT_SELECTED, {address}));
        const gidPre = groupId ? `/${groupId}` : '';
        if(withdraw){
            history.push(`${gidPre}/unstake/${address}/${network}`);
        }else{
            history.push(`${gidPre}/stake/${address}/${network}`);
        }
    }
} as StakingContractDispatch);

export const StakingContract = ({
    mapDispatchToProps,
    mapStateToProps,
});
