import { AnyAction, Dispatch } from "redux";
import { IocModule, inject } from "../../common/IocModule";
import { addAction, CommonActions } from "../../common/Actions";
import { RootState, StakeTokenState } from "../../common/RootState";
import { StakingAppClient } from "../../services/StakingAppClient";
import { StakingApp } from "../../common/Types";
import { Utils } from "../../common/Utils";

const StakeTokenActions = {
    AMOUNT_TO_STAKE_CHANGED: 'AMOUNT_TO_STAKE_CHANGED',
    STAKE_FAILED: 'STAKE_FAILED',
};

const Actions = StakeTokenActions;

export interface StakeTokenProps extends StakeTokenState {
    symbol: string;
    contract: StakingApp;
    balance: string;
}

export interface StakeTokenDispatch {
    onStakeToken: (props: StakeTokenProps) => Promise<void>;
    onAmountToStakeChanged: (v:number) => Promise<void>;
}

function mapStateToProps(state: RootState): StakeTokenProps {
    const userProfile = state.data.userData?.profile;
    const addr = userProfile?.accountGroups[0]?.addresses || {};
    const address = addr[0] || {};
    return {
        ...state.ui.stakeToken,
        symbol: address.symbol,
        contract: Utils.selectedContrat(state, state.data.stakingData.selected || '') || {} as any,
        balance: address.balance,
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onStakeToken: async (props:any) => {
        try{
            dispatch(addAction(CommonActions.WAITING, { source: 'stakeToken' }));
            await IocModule.init(dispatch);
            const wyre = inject<StakingAppClient>(StakingAppClient);
            const data = await wyre.stakeSignAndSend(dispatch,props.amount,props.address,props.currency,props.symbol);
            // todo: if successful, get user staking data and redirect to staking info page
            // todo: if not successful, return error
        } catch (e) {
            console.error('StakeToken.mapDispatchToProps', e);
            dispatch(addAction(Actions.STAKE_FAILED, { error: e.toString() }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'stakeToken' }));
        }
    },
    onAmountToStakeChanged: async (v:number) => {
        console.log(v);
        dispatch(addAction(Actions.AMOUNT_TO_STAKE_CHANGED, { amount: v }));
    },
} as StakeTokenDispatch);

const defaultStakeTokenState = {
    amount: '0',
}

function reduce(state: StakeTokenState = defaultStakeTokenState, action: AnyAction) {    
    switch(action.type) {
        case Actions.STAKE_FAILED:
            return {...state, error: action.payload.error};
        case Actions.AMOUNT_TO_STAKE_CHANGED:
            return {...state, error: undefined, amount: action.payload.amount}
        default:
        return state;
    }
}

export const StakeToken = ({
    mapDispatchToProps,
    mapStateToProps,
    reduce
});