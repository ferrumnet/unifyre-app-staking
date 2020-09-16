import { AnyAction, Dispatch } from "redux";
import { inject } from "../../common/IocModule";
import { ContinuationState, RootState, StakeTokenState } from "../../common/RootState";
import { StakingAppClient, StakingAppServiceActions } from "../../services/StakingAppClient";
import { StakeEvent } from "../../common/Types";
import { Big } from 'big.js';
import { CommonActions } from "../../common/Actions";

export interface ConfirmationProps {
    stakeEvent?: StakeEvent;
    action: 'stake' | 'unstake';
    amount: string;
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
            action: 'stake',
            amount: '',
        } as ConfirmationProps;
    }
    const amount = state.ui.continuation.action === 'unstake' ? 
        new Big(event.amountUnstaked).add(new Big(event.amountUnstaked)).toFixed() :
        event.amountStaked;
    return {
        stakeEvent: event,
        action: state.ui.continuation.action,
        amount,
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onLoad: async (requestId: string) => {
        const client = inject<StakingAppClient>(StakingAppClient);            
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
        case StakingAppServiceActions.STAKING_CONTACT_RECEIVED:
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