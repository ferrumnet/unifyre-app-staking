import { AnyAction, Dispatch } from "redux";
import { RootState } from "../../../common/RootState";
import { TokenBridgeActions } from "../../TokenBridgeClient";
import { inject, IocModule } from '../../../common/IocModule';
import { addAction, CommonActions } from "../../../common/Actions";
import { TokenBridgeClient } from "../../TokenBridgeClient";
import { PairedAddress } from "../../TokenBridgeTypes";
import { CurrencyList } from "unifyre-extension-web3-retrofit";
import { SignedPairAddress } from "./../../TokenBridgeTypes";
import { ValidationUtils } from "ferrum-plumbing";
import { AddressDetails } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";

export const LiquidityActions = {
    AMOUNT_CHANGED: 'AMOUNT_CHANGED',
    TOKEN_SELECTED: 'TOKEN_SELECTED',
    SWAP_DETAILS: 'SWAP_DETAILS',
    SWAP_SUCCESS: 'SWAP_SUCCESS',
    ADD_LIQUIDITY_SUCCESS: 'ADD_LIQUIDITY_SUCCESS',
    ADD_LIQUIDITY_FAILED: 'ADD_LIQUIDITY_FAILED',
    REMOVE_LIQUIDITY_SUCCESS: 'REMOVE_LIQUIDITY_SUCCESS',
    REMOVE_LIQUIDITY_FAILED: 'REMOVE_LIQUIDITY_FAILED',
};

const Actions = LiquidityActions;

export interface liquidityDisptach {
    onConnect: (network: string) => void,
    amountChanged: (v?:string) => void,
    tokenSelected: (v?:string,add?: AddressDetails[]) => void,
    addLiquidity: (amount: string,targetCurrency: string,success: (v:string)=>void) => void,
    removeLiquidity: (amount: string,targetCurrency: string,success: (v:string)=>void) => void
}

export interface liquidityProps{
    network: string,
    symbol: string,
    baseAddress: string,
    pairAddres?: PairedAddress,
    currency: string,
    pairedAddress?: SignedPairAddress,
    amount: string,
    baseSignature: string,
    destAddress: string,
    destNetwork: string,
    baseNetwork: string,
    destSignature: string,
    selectedToken: string,
    addresses: AddressDetails[],
    availableLiquidity: string,
}

export interface liquidityState{
    network: string,
    symbol: string,
    baseAddress: string,
    pairAddres?: PairedAddress,
    currency: string,
    pairedAddress?: SignedPairAddress,
    amount: string,
    baseSignature: string,
    destAddress: string,
    destNetwork: string,
    baseNetwork: string,
    destSignature: string,
    selectedToken: string,
    addresses: AddressDetails[],
    availableLiquidity: string,
}

export function mapStateToProps(state:RootState):liquidityProps  {
    const userProfile = state.data.userData?.profile;
    const addr = userProfile?.accountGroups[0]?.addresses || {};
    const address = addr[0] || {};
    return {
        ...state.ui.liquidity,
        symbol: address.symbol,
        network: address.network,
        currency: address.currency,
        baseAddress: address.address,
        pairedAddress: state.ui.liquidity.pairedAddress,
        amount: state.ui.liquidity.amount,
        selectedToken: state.ui.liquidity.selectedToken,
        destNetwork: state.ui.liquidity.destNetwork,
        baseNetwork: state.ui.liquidity.baseNetwork,
        availableLiquidity: state.ui.liquidity.availableLiquidity,
        addresses: addr
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
                const ls = currenciesList.map((j:any) => j.sourceCurrency)
                console.log(currencyList,'currencieslist',ls)
                currencyList.set(currenciesList.map((j:any) => j.sourceCurrency));
            }
            const res  = await sc.signInToServer(dispatch);
            return res;
        } catch(e) {
            if(!!e.message){
                dispatch(addAction(TokenBridgeActions.AUTHENTICATION_FAILED, {message: e.message }));
            }
        }finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    addLiquidity: async (amount: string,targetCurrency: string,success: (v:string)=>void) => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            const client = inject<TokenBridgeClient>(TokenBridgeClient);
            ValidationUtils.isTrue(!!targetCurrency,'targetCurrency is required')
            const res = await client.addLiquidity(dispatch, targetCurrency, amount);
            if(res){
                success('Liquidity Added Successfully and processing')

            }
        } catch(e) {
            if(!!e.message){
                dispatch(addAction(TokenBridgeActions.AUTHENTICATION_FAILED, {message: e.message }));
            }
        }finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    removeLiquidity: async (amount: string,targetCurrency: string,success: (v:string)=>void) => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            const client = inject<TokenBridgeClient>(TokenBridgeClient);
            ValidationUtils.isTrue(!!targetCurrency,'targetCurrency is required')
            const res = await client.removeLiquidity(dispatch, targetCurrency, amount);
            if(res){
                success('Liquidity Removal Successfully processing')
            }
        } catch(e) {
            if(!!e.message){
                dispatch(addAction(TokenBridgeActions.AUTHENTICATION_FAILED, {message: e.message }));
            }
        }finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    amountChanged: (v?: string) => dispatch(addAction(Actions.AMOUNT_CHANGED,{value: v})),
    tokenSelected: async (v?: any,addr?: AddressDetails[]) => {
        try{
            let details = addr?.find(e=>e.symbol === v);
            await IocModule.init(dispatch);
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);

            if(details){
                dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
                //get vailable liquidity
                await sc.getUserLiquidity(dispatch,details?.address, details?.currency)
            }
            dispatch(addAction(Actions.TOKEN_SELECTED,{value: v || {},details}))
        }catch(e) {
            if(!!e.message){
                dispatch(addAction(TokenBridgeActions.AUTHENTICATION_FAILED, {message: e.message }));
            }
        }finally {
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }      
    }
} as liquidityDisptach )

const defaultState = {
    destAddress: '',
    destSignature: '',
    baseSignature: '',
    balance: '0',
    addresses: [],
    selectedToken: '',
    message: '',
    availableLiquidity: '0',
    currenciesDetails: {},
    network: '',
    symbol: '',
    baseAddress: '',
    currency: '',
    amount: '',
    destNetwork: '',
    baseNetwork: ''
}

export function reduce(state: liquidityState = defaultState, action: AnyAction){
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
                baseNetwork: action.payload.pairedAddress.pair?.network1,
                initialised: true
            }
        case TokenBridgeActions.USER_AVAILABLE_LIQUIDITY_FOR_TOKEN:
            return {...state,availableLiquidity: action.payload.liquidity}
        case Actions.AMOUNT_CHANGED:
            return {
                ...state, amount: action.payload.value
            }
        case Actions.TOKEN_SELECTED:
            return {
                ...state,selectedToken: action.payload.value,swapDetails: action.payload.details
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