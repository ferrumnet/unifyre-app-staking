import { AnyAction, Dispatch } from "redux";
import { IocModule, inject } from "../../common/IocModule";
import { addAction, CommonActions } from "../../common/Actions";
import { RootState, StakeTokenState } from "../../common/RootState";
import { StakingAppClient, StakingAppServiceActions } from "../../services/StakingAppClient";
import { StakeEvent, StakingApp } from "../../common/Types";
import { History } from 'history';
import {formatter,StakingState,Utils,logError} from '../../common/Utils';
import { ValidationUtils } from "ferrum-plumbing";
import { Big } from 'big.js';
import { UserStake } from "../../common/Types";
import { LocaleManager } from "unifyre-react-helper";

const StakeTokenActions = {
    AMOUNT_TO_STAKE_CHANGED: 'AMOUNT_TO_STAKE_CHANGED',
};

const Actions = StakeTokenActions;

export interface StakeTokenProps extends StakeTokenState {
    network: string;
    userAddress: string;
    stakeEvents: StakeEvent[];
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
    groupId?: string;
    isRewardZero: boolean;
}

export interface StakeTokenDispatch {
    onStakeToken: (history: History, props: StakeTokenProps) => Promise<void>;
    onAmountToStakeChanged: (v: string) => Promise<void>;
    refreshStaking: () => void
}

function mapStateToProps(state: RootState): StakeTokenProps {
    const userProfile = state.data.userData?.profile;
    const addr = userProfile?.accountGroups[0]?.addresses || {};
    const address = addr[0] || {};
    const contract = state.data.stakingData.selectedContract || {} as any as StakingApp;
    const rewards = Utils.stakingRewards(contract);
    const stakeOf = state?.data?.stakingData?.userStake || {} as any as UserStake;
    const totB = new Big(contract.stakedTotal || '0');
    const capB = new Big(contract.stakingCap || '0');
    const isRewardZero = contract.totalReward == '0';
    return {
        ...state.ui.stakeToken,
        network: address.network,
        symbol: address.symbol,
        contract: state.data.stakingData.selectedContract || {} as any,// || Utils.selectedContrat(state, (window.location.href.split('/')[4]) || '') || {} as any,
        balance: address.balance,
        stakedAmount: state.data.stakingData.userStake?.amountInStake || '',
        userAddress: address.address,
        stakeEvents: state.data.stakingData.stakeEvents,
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
        unstakeRewardsNow: `${LocaleManager.formatDecimalString(
            Utils.unstakeRewardsAt(contract, stakeOf.amountInStake, Date.now()))} ${contract.rewardSymbol || contract.symbol || ''}`,
        unstakeRewardsMaturity: `${LocaleManager.formatDecimalString(
            Utils.unstakeRewardsAt(contract, stakeOf.amountInStake, contract.withdrawEnds * 1000 + 1))} ${contract.rewardSymbol || contract.symbol || ''}`,
        filled: capB.minus(totB).lte(new Big(0)),
        groupId: state.data.groupData.info?.groupId,
        isRewardZero,
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onStakeToken: async (history, props) => {
        try{
            dispatch(addAction(CommonActions.WAITING, { source: 'stakeToken' }));
            ValidationUtils.isTrue(
                new Big(props.amount || '0').gte(new Big(props.contract.minContribution || '0')),
                `Minimum contribution is ${props.contract.minContribution} ${props.contract.symbol}`);
            if (props.contract.maxContribution) {
                ValidationUtils.isTrue(
                    new Big(props.amount || '0').lt(new Big(props.contract.maxContribution)),
                    `Maximum contribution is ${props.contract.maxContribution} ${props.contract.symbol}`);
            }
            await IocModule.init(dispatch);
            const client = inject<StakingAppClient>(StakingAppClient);
            const data = await client.stakeSignAndSend(
                dispatch, props.amount,
                props.contract.network,
                props.contract.contractAddress,
                props.userAddress,
                props.balance,
                );
            if (!!data) {
                const gidPrefix = props.groupId ? `/${props.groupId}` : '';
                history.replace(`${gidPrefix}/continuation`);
            }
        } catch (e) {
            logError('StakeToken.mapDispatchToProps', e);
            dispatch(addAction(StakingAppServiceActions.STAKING_FAILED, { message: e.toString() }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'stakeToken' }));
        }
    },
    onAmountToStakeChanged: async (v: string) => {
        dispatch(addAction(Actions.AMOUNT_TO_STAKE_CHANGED, { amount: v }));
    },
    refreshStaking: () => {
        dispatch(addAction(StakingAppServiceActions.STAKING_SUCCESS, { transactionData: [''] }));
    }
} as StakeTokenDispatch);

const defaultStakeTokenState = {
    amount: '0',
    transactionId: '',
    showConfirmation: false
}

function reduce(state: StakeTokenState = defaultStakeTokenState, action: AnyAction) {    
    switch(action.type) {
        case StakingAppServiceActions.STAKING_FAILED:
            return {...state, error: action.payload.message};
        case Actions.AMOUNT_TO_STAKE_CHANGED:
            return {...state, error: undefined, amount: action.payload.amount}
        case StakingAppServiceActions.STAKING_SUCCESS:
            return {...state,transactionId: action.payload.transactionData[0],showConfirmation:!state.showConfirmation}
        default:
        return state;
    }
}

export const StakeToken = ({
    mapDispatchToProps,
    mapStateToProps,
    reduce
});