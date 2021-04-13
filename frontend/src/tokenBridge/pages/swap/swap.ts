import { AnyAction, Dispatch } from "redux";
import { DashboardState, RootState } from "../../../common/RootState";
import { TokenBridgeActions } from "../../TokenBridgeClient";
import { inject, IocModule } from '../../../common/IocModule';
import { addAction, CommonActions } from "../../../common/Actions";
import { TokenBridgeClient } from "../../TokenBridgeClient";
import { PairedAddress } from "../../TokenBridgeTypes";
import { CurrencyList } from "unifyre-extension-web3-retrofit";

export interface swapDisptach {
    onConnect: (network: string) => void
}

export interface swapProps{
    network: string,
    symbol: string,
    baseAddress: string,
    pairAddres?: PairedAddress
}

export interface swapState{
    network: string,
    symbol: string,
    baseAddress: string
}

export function mapStateToProps(state:RootState):swapProps  {
    const userProfile = state.data.userData?.profile;
    const addr = userProfile?.accountGroups[0]?.addresses || {};
    const address = addr[0] || {};
    return {
        ...state.ui.swap,
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
            // TODO:
            // Get list of source currencies for the network, and set them on the currency list object
            // get an instance of CurrencyList
            // currencyList.set([defaultCur]);
            const currencyList = inject<CurrencyList>(CurrencyList);
            currencyList.set(['RINKEBY:0xfe00ee6f00dd7ed533157f6250656b4e007e7179']);
            const res  = await sc.signInToServer(dispatch);
            return res;
        } catch(e) {
            throw e;
        }finally {
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);
            const res = await sc.getUserWithdrawItems(dispatch,network);
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },

} as swapDisptach )

const defaultState = {
    network: '',
    symbol: '',
    baseAddress: ''
}

export function reduce(state: swapState = defaultState, action: AnyAction){
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

export const Swap = ({
    mapStateToProps,
    mapDispatchToProps,
    reduce
})