import { AnyAction, Dispatch } from "redux";
import { DashboardState, RootState } from "../../../common/RootState";
import { TokenBridgeActions } from "../../TokenBridgeClient";
import { inject, IocModule } from '../../../common/IocModule';
import { addAction, CommonActions } from "../../../common/Actions";
import { TokenBridgeClient } from "../../TokenBridgeClient";
import { PairedAddress, SignedPairAddress } from "../../TokenBridgeTypes";
import { CurrencyList } from "unifyre-extension-web3-retrofit";
import { Network } from "ferrum-plumbing";
import { AddressDetails } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { DashboardActions } from './../../pages/Dashboard/Dashboard';

export const LiquidityActions = {
    AMOUNT_CHANGED: 'AMOUNT_CHANGED',
    TOKEN_SELECTED: 'TOKEN_SELECTED',
    SWAP_DETAILS: 'SWAP_DETAILS',
    SWAP_SUCCESS: 'SWAP_SUCCESS'
};

const Actions = LiquidityActions;

export interface swapDisptach {
    onConnect: (network: string) => void,
    amountChanged: (v?:string) => void,
    tokenSelected: (v?:string,add?: AddressDetails[]) => void,
    onSwap: (amount:string,currency:string,targetNet: string,v: (v:string)=>void,y: (v:string)=>void) => Promise<void>
}

export interface swapProps{
    network: string,
    symbol: string,
    baseAddress: string,
    baseSignature: string,
    destAddress: string,
    destNetwork: string,
    destSignature: string,
    pairedAddress?: SignedPairAddress,
    amount: string,
    balance: string,
    selectedToken: string,
    addresses: AddressDetails[],
    swapDetails: AddressDetails,
    message: string,
    messageType: 'error' | 'success',
    currenciesDetails: any
}

export interface swapState{
    network: string,
    symbol: string,
    baseAddress: string,
    baseSignature: string,
    destAddress: string,
    destSignature: string,
    pairedAddress?: SignedPairAddress,
    amount: string,
    balance: string,
    selectedToken: string,
    destNetwork: string,
    addresses: AddressDetails[],
    swapDetails: AddressDetails,
    message: string,
    error:string,
    messageType: 'error' | 'success',
    currenciesDetails: any
}

export function mapStateToProps(state:RootState):swapProps  {
    const userProfile = state.data.userData?.profile;
    const addr = userProfile?.accountGroups[0]?.addresses || {};
    const address = addr[0] || {};
    return {
        ...state.ui.swap,
        symbol: address.symbol,
        network: address.network,
        baseAddress: state.ui.swap.baseAddress,
        baseSignature: state.ui.swap.baseSignature,
        destAddress: state.ui.swap.destAddress,
        destSignature: state.ui.swap.destSignature,
        balance: address.balance,
        amount: state.ui.swap?.amount,
        addresses: addr,
        selectedToken: state.ui.swap.selectedToken,
        swapDetails: state.ui.swap.swapDetails,
        destNetwork: state.ui.swap.destNetwork,
        currenciesDetails: state.ui.swap.currenciesDetails,
        message: state.ui.swap.message,
        messageType: state.ui.swap.messageType
    }
}

export const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onConnect: async (network: string) => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);
            const currenciesList = await sc.getSourceCurrencies(dispatch,network);
            if(currenciesList.length > 0){
                dispatch(addAction(Actions.SWAP_DETAILS,{value: currenciesList}))                
                const currencyList = inject<CurrencyList>(CurrencyList);
                currencyList.set(currenciesList.map((j:any) => j.sourceCurrency));
            }
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
    getLiquidity: async (network: Network,currency: string) => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);
            const res  = await sc.getAvailableLiquidity(dispatch, network,currency);
            
        } catch(e) {
            throw e;
        }finally {
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);
            const res = await sc.getUserWithdrawItems(dispatch,network);
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    amountChanged: (v?: string) => dispatch(addAction(Actions.AMOUNT_CHANGED,{value: v})),
    tokenSelected: async (v?: any,addr?: AddressDetails[]) => {
        let details = addr?.find(e=>e.symbol === v);
        await IocModule.init(dispatch);
        const sc = inject<TokenBridgeClient>(TokenBridgeClient);
        if(details){
            //get vailable liquidity
            //await sc.getAvailableLiquidity(dispatch,details?.network, details?.currency)
        }
        dispatch(addAction(Actions.TOKEN_SELECTED,{value: v || {},details}))
    },
    onSwap: async (amount:string,currency:string,targetNet: string,v: (v:string)=>void,y: (v:string)=>void) => {
        try {
            const client = inject<TokenBridgeClient>(TokenBridgeClient);        
            const res = await client.swap(dispatch,currency, amount, targetNet);
            if( res === 'success' ){
                y('Swap Successful, Kindly View Withdrawal Items for item checkout.');
                dispatch(addAction(Actions.SWAP_SUCCESS, {message: res }));
                return
            }
            v('error occured')
        }catch(e) {
            if(!!e.message){
                dispatch(addAction(TokenBridgeActions.AUTHENTICATION_FAILED, {message: e.message }));
            }
        }finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
        
    }

} as swapDisptach )

const defaultState = {
    network: '',
    symbol: '',
    baseAddress: '',
    amount: '',
    destAddress: '',
    destSignature: '',
    baseSignature: '',
    balance: '0',
    addresses: [],
    selectedToken: '',
    message: '',
    currenciesDetails: {}
}

export function reduce(state: any = defaultState, action: AnyAction){
    switch(action.type){
        case TokenBridgeActions.BRIDGE_LIQUIDITY_PAIRED_ADDRESS_RECEIVED:
            return {...state, 
                signedPairedAddress: action.payload.pairedAddress,
                pairedAddress: action.payload.pairedAddress, 
                baseAddress:action.payload.pairedAddress.pair?.address1,
                destAddress:action.payload.pairedAddress.pair?.address2,
                baseSignature: action.payload.pairedAddress.signature1,
                destSignature: action.payload.pairedAddress.signature2,
                isPaired: action.payload.pairedAddress.pair?.address2 ?  true : false,
                baseSigned: action.payload.pairedAddress.signature1 ? true: false,
                network: action.payload.pairedAddress.pair?.network1,
                destNetwork: action.payload.pairedAddress.pair?.network2,
                baseNetwork: action.payload.pairedAddress.pair?.network2,
                initialised: true
            }
        case Actions.AMOUNT_CHANGED:
            return {
                ...state, amount: action.payload.value
            }
        case Actions.TOKEN_SELECTED:
            return {
                ...state,selectedToken: action.payload.value,swapDetails: action.payload.details
            }
        case Actions.SWAP_DETAILS:
            return {
                ...state,currenciesDetails: action.payload.value[0]
            }
        case Actions.SWAP_SUCCESS:
            return {...state,message: action.payload.message,messageType: 'success', amount: ''}
        case TokenBridgeActions.AUTHENTICATION_FAILED:
            return {
                ...state,message: action.payload.message,messageType: 'error', amount: ''
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