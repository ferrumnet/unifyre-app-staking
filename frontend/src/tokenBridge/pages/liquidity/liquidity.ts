import { AnyAction, Dispatch } from "redux";
import { DashboardState, RootState } from "../../../common/RootState";
import { TokenBridgeActions } from "../../TokenBridgeClient";
import { inject, IocModule } from '../../../common/IocModule';
import { addAction, CommonActions } from "../../../common/Actions";
import { TokenBridgeClient } from "../../TokenBridgeClient";
import { PairedAddress } from "../../TokenBridgeTypes";

export interface liquidityDisptach {
    onConnect: (network: string) => void
}

export interface liquidityProps{
    network: string,
    symbol: string,
    baseAddress: string,
    pairAddres?: PairedAddress
}

export interface liquidityState{
    network: string,
    symbol: string,
    baseAddress: string
}

export function mapStateToProps(state:RootState):liquidityProps  {
    const userProfile = state.data.userData?.profile;
    const addr = userProfile?.accountGroups[0]?.addresses || {};
    const address = addr[0] || {};
    return {
        ...state.ui.liquidity,
        symbol: address.symbol,
        network: state.ui.bridgeMain.network || address.network,
        baseAddress: address.address,
    }
}

export const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onConnect: async (network: string) => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);
            const res  = await sc.signInToServer(dispatch);
            
        } catch(e) {
            throw e;
        }finally {
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);
            const res = await sc.getUserWithdrawItems(dispatch,network);
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },

} as liquidityDisptach )

const defaultState = {
    network: '',
    symbol: '',
    baseAddress: ''
}

export function reduce(state: liquidityState = defaultState, action: AnyAction){
    switch(action.type){
        case TokenBridgeActions.BRIDGE_LIQUIDITY_PAIRED_ADDRESS_RECEIVED:
            return {...state, 
                pairedAddress: action.payload.pairedAddress, 
                baseAddress:action.payload.pairedAddress.pair?.address1,
                destAddress:action.payload.pairedAddress.pair?.address2,
                baseSignature: action.payload.pairedAddress.pair?.network1,
                destSignature: action.payload.pairedAddress.pair?.network2,
            }
        default:
            return state;
    }
}

export const Liquidity = ({
    mapStateToProps,
    mapDispatchToProps,
    reduce
})