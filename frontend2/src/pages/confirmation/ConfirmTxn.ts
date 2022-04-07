import { AnyAction, Dispatch } from "redux";
import { inject } from "../../common/IocModule";
import { ContinuationState, RootState } from "../../common/RootState";
import { StakingAppClient } from "../../services/StakingAppClient";
import { StakeEvent } from "../../common/Types";
import { Big } from 'big.js';
import { CommonActions } from "../../common/Actions";

export interface ConfirmationProps extends ContinuationState {
    stakeEvent?: StakeEvent;
    action: 'stake' | 'unstake';
    amount: string;
    rewardAmount: string;
    groupId?: string;
}

export interface ConfirmationDispatch {
    onLoad: (requestId: string) => Promise<void>;
    onRefresh: (props: ConfirmationProps) => Promise<void>
}

function mapStateToProps(state: RootState): ConfirmationProps {
    const event = (state.data.stakingData.stakeEvents || [])
            .find(se => se.mainTxId === state.ui.continuation.selectedStakeEvent)!;
    if (!event) {
        return {
            ...state.ui.continuation,
            action: 'stake',
            amount: '',
        } as ConfirmationProps;
    }
    const amount = state.ui.continuation.action === 'unstake' ? 
        new Big(event.amountUnstaked || event.amountStaked || '0').toFixed() :
        event.amountStaked;
    const rewardAmount = state.ui.continuation.action === 'unstake' ? 
        new Big(event.amountOfReward || '0').toFixed() :
       '';
    return {
        ...state.ui.continuation,
        stakeEvent: event,
        amount,
        rewardAmount,
        groupId: state.data.groupData.info.groupId,
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onLoad: async (requestId: string) => {
        const client = inject<StakingAppClient>(StakingAppClient);    
        console.log('responseresponseresponse');
        await client.processRequest(dispatch, requestId);
    },
    onRefresh: async (props:ConfirmationProps) => {
        if (!props.stakeEvent) { return; }
        const client = inject<StakingAppClient>(StakingAppClient);            
        await client.refreshStakeEvents(dispatch, [props.stakeEvent!]);
    }
} as ConfirmationDispatch);

const defaultconfirmationState = {
    action: '' as any,
} as ContinuationState;

function reduce(state: ContinuationState = defaultconfirmationState, action: AnyAction) {    
    switch(action.type) {
        case CommonActions.CONTINUATION_DATA_RECEIVED:
            const {action: continuationAction, mainTxId} = action.payload;
            return {...state, error: undefined, action: continuationAction,
                selectedStakeEvent: mainTxId};
        case CommonActions.CONTINUATION_DATA_FAILED:
            return {...state, error: action.payload.message};
        default:
        return state;
    }
}

export const ConfirmTxn = ({
    mapDispatchToProps,
    mapStateToProps,
    reduce
});