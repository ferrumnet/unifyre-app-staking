import { AnyAction, Dispatch } from "redux";
import { IocModule, inject } from "../../common/IocModule";
import { addAction, CommonActions } from "../../common/Actions";
import { RootState, StakeTokenState } from "../../common/RootState";
import { StakingAppClient, StakingAppServiceActions } from "../../services/StakingAppClient";
import { StakeEvent, StakingApp } from "../../common/Types";
import { History } from 'history';
import {Utils} from '../../common/Utils';

const confirmationActions = {
};

const Actions = confirmationActions;

export interface confirmationProps extends StakeTokenState {
    network: string;
    symbol: string;
    userAddress: string;
    stakeEvents: StakeEvent[];
    stakeEvent: StakeEvent;
}

export interface confirmationDispatch {
    refreshStaking: (props: confirmationProps) => Promise<void>
}

function mapStateToProps(state: RootState): confirmationProps {
    const userProfile = state.data.userData?.profile;
    const addr = userProfile?.accountGroups[0]?.addresses || {};
    const address = addr[0] || {};
    let eventLength = state.data.stakingData.stakeEvents.length;
    return {
        ...state.ui.stakeToken,
        network: address.network,
        symbol: address.symbol,
        userAddress: address.address,
        stakeEvent: Utils.selectedTransaction(state, (window.location.href.split('/')[4]) || '') || {} as any,
        stakeEvents: state.data.stakingData.stakeEvents
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    refreshStaking: async (props:confirmationProps) => {
        const client = inject<StakingAppClient>(StakingAppClient);            
        console.log('called');        
        await client.refreshStakeEvents(dispatch, props.stakeEvents);
    }
} as confirmationDispatch);

const defaultconfirmationState = {
    amount: '0',
    transactionId: '',
    showConfirmation: false
}

function reduce(state: StakeTokenState = defaultconfirmationState, action: AnyAction) {    
    switch(action.type) {
        case StakingAppServiceActions.STAKING_FAILED:
            return {...state, error: action.payload.message};
        case StakingAppServiceActions.STAKING_SUCCESS:
            return {...state,transactionId: action.payload.transactionData[0],showConfirmation:!state.showConfirmation}
        default:
        return state;
    }
}

export const ConfirmTxn = ({
    mapDispatchToProps,
    mapStateToProps,
    reduce
});