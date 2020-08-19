import { AnyAction, Dispatch } from "redux";
import { addAction } from "../../common/Actions";
import { RootState, StakeTokenState } from "../../common/RootState";
import { StakeToken, StakeTokenProps } from "../stakeToken/StakeToken";

const UnstakeTokenActions = {
    AMOUNT_TO_UN_STAKE_CHANGED: 'AMOUNT_TO_UN_STAKE_CHANGED',
    UN_STAKE_FAILED: 'UN_STAKE_FAILED',
};

const Actions = UnstakeTokenActions;

export interface UnstakeTokenProps extends StakeTokenProps {
}

export interface UnstakeTokenDispatch {
    onUnstakeToken: (props: UnstakeTokenProps) => Promise<void>;
    onAmountToUnstakeChanged: (v:number) => Promise<void>;
}

function mapStateToProps(state: RootState): StakeTokenProps {
    return {
        ...(StakeToken.mapStateToProps(state)),
        ...state.ui.stakeToken,
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onUnstakeToken: async (props:any) => {
        // TODO: Implement
    },
    onAmountToUnstakeChanged: async (v:number) => {
        dispatch(addAction(Actions.AMOUNT_TO_UN_STAKE_CHANGED, { amount: v }));
    },
} as UnstakeTokenDispatch);

const defaultUnstakeTokenState = {
    amount: '0',
}

function reduce(state: StakeTokenState = defaultUnstakeTokenState, action: AnyAction) {    
    switch(action.type) {
        case Actions.UN_STAKE_FAILED:
            return {...state, error: action.payload.error};
        case Actions.AMOUNT_TO_UN_STAKE_CHANGED:
            return {...state, error: undefined, amount: action.payload.amount}
        default:
        return state;
    }
}

export const UnstakeToken = ({
    mapDispatchToProps,
    mapStateToProps,
    reduce
});