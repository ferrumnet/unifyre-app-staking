import { AnyAction, Dispatch } from "redux";
import { DashboardState, RootState } from "../../../common/RootState";
import { TokenBridgeActions } from "../../TokenBridgeClient";
import { inject, IocModule } from '../../../common/IocModule';
import { addAction, CommonActions } from "../../../common/Actions";
import { TokenBridgeClient } from "../../TokenBridgeClient";
import { PairedAddress, SignedPairAddress,UserBridgeWithdrawableBalanceItem } from "../../TokenBridgeTypes";
import { CurrencyList } from "unifyre-extension-web3-retrofit";
import { Network, ValidationUtils } from "ferrum-plumbing";
import { AddressDetails } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { MainBridgeActions } from './../main/main';
import { Connect } from 'unifyre-extension-web3-retrofit';

export const LiquidityActions = {
    AMOUNT_CHANGED: 'AMOUNT_CHANGED',
    TOKEN_SELECTED: 'TOKEN_SELECTED',
    SWAP_DETAILS: 'SWAP_DETAILS',
    SWAP_SUCCESS: 'SWAP_SUCCESS',
    WITHDRAWAL_ITEMS_FETCHED: 'WITHDRAWAL_ITEMS_FETCHED',
    DISCONNECT: 'DISCONNECT',
    CHECK_ALLOWANCE:'CHECK_ALLOWANCE',
    USER_DATA_RECEIVED:'USER_DATA_RECEIVED',
    APPROVAL_SUCCESS: 'APPROVAL_SUCCESS',
    TRIGGER_PANEL: 'TRIGGER_PANEL'
};

const Actions = LiquidityActions;

export interface swapDisptach {
    onConnect: (network: string,currency: string, address: string) => void,
    amountChanged: (v?:string) => void,
    executeWithrawItem: (item:UserBridgeWithdrawableBalanceItem,success:(v:string)=>void,error:(v:string)=>void) => void,
    updatePendingWithrawItems: () => void,
    tokenSelected: (targetNet: string,v?:string,add?: AddressDetails[],pair?: PairedAddress,history?: any) => void,
    onSwap: (
        amount:string,balance:string,currency:string,targetNet: string,v: (v:string)=>void,
        y: (v:string)=>void,allowanceRequired: boolean,showModal: () => void
    ) => Promise<void>,
    openPanelHandler: () => void,
    checkTxStatus: (txId:string,sendNetwork:string,timestamp:number) => Promise<string>
    checkifItemIsCreated: (itemId: string) => Promise<string>
}

export interface swapProps{
    network: string,
    symbol: string,
    baseAddress: string,
    baseSignature: string,
    destAddress: string,
    destNetwork: string,
    baseNetwork: string,
    destSignature: string,
    pairedAddress: SignedPairAddress,
    amount: string,
    balance: string,
    selectedToken: string,
    addresses: AddressDetails[],
    swapDetails: AddressDetails,
    message: string,
    currency: string,
    availableLiquidity: string,
    messageType: 'error' | 'success',
    currenciesDetails: any,
    signedPairedAddress?: SignedPairAddress,
    allowanceRequired: boolean,
    userWithdrawalItems: any[],
    groupId: string,
    swapId: string,
    itemId: string,
}

export interface swapState{
    network: string,
    symbol: string,
    baseAddress: string,
    baseSignature: string,
    destAddress: string,
    destSignature: string,
    pairedAddress: SignedPairAddress,
    amount: string,
    balance: string,
    selectedToken: string,
    destNetwork: string,
    baseNetwork: string,
    addresses: AddressDetails[],
    swapDetails: AddressDetails,
    message: string,
    error:string,
    currency: string,
    signedPairedAddress?: SignedPairAddress,
    allowanceRequired: boolean,
    messageType: 'error' | 'success',
    currenciesDetails: any,
    availableLiquidity: string,
    userWithdrawalItems: any[],
    groupId: string,
    swapId: string,
    itemId: string,
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
        baseNetwork: state.ui.swap.baseNetwork,
        currenciesDetails: state.ui.swap.currenciesDetails,
        currency: address.currency,
        message: state.ui.swap.message,
        messageType: state.ui.swap.messageType,
        availableLiquidity: state.ui.swap.availableLiquidity,
        userWithdrawalItems: state.ui.swap.userWithdrawalItems || [],
        allowanceRequired: state.ui.swap.allowanceRequired,
        groupId: state.data.groupData.info.groupId,
        swapId: state.ui.swap.swapId,
        itemId: state.ui.swap.itemId
    }
}

export const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onConnect: async (network,network1,currency) => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);
            const connect = inject<Connect>(Connect);
            const network = connect.network() as any;
            const currenciesList = await sc.getSourceCurrencies(dispatch,network);
            if(currenciesList.length > 0){
                dispatch(addAction(Actions.SWAP_DETAILS,{value: currenciesList}))                
                const currencyList = inject<CurrencyList>(CurrencyList);
                const allowance = await sc.checkAllowance(dispatch,currency,'5', network1);
                dispatch(addAction(Actions.CHECK_ALLOWANCE,{value: allowance}))
                currencyList.set(currenciesList.map((j:any) => j.sourceCurrency));
            }
           
            const res  = await sc.signInToServer(dispatch);
            const items = await sc.getUserWithdrawItems(dispatch,network1);
            if(items.withdrawableBalanceItems.length > 0){
                dispatch(addAction(Actions.WITHDRAWAL_ITEMS_FETCHED,{items: items.withdrawableBalanceItems}));
            }

            return res;
        } catch(e) {
            throw e;
        }finally {
            
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    getLiquidity: async (network: Network,currency: string) => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);
            await sc.getAvailableLiquidity(dispatch, network,currency);
        } catch(e) {
            throw e;
        }finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    amountChanged: (v?: string) => {
        dispatch(addAction(Actions.AMOUNT_CHANGED,{value: v}));
        dispatch(addAction(MainBridgeActions.CLEAR_ERROR,{}));
    },
    tokenSelected: async (targetNet: string,v?: any,addr?: AddressDetails[],pair?: PairedAddress,history?: any) => {
        try{
            let details = addr?.find(e=>e.symbol === v);
            await IocModule.init(dispatch);
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);
            const connect = inject<Connect>(Connect);
            const network = connect.network() as any;
            const currenciesList = await sc.getSourceCurrencies(dispatch,network);
            if(!pair){
                history.push(0);
            }
            if(currenciesList.length > 0){
                dispatch(addAction(Actions.SWAP_DETAILS,{value: currenciesList}))                
                const currencyList = inject<CurrencyList>(CurrencyList);
                currencyList.set(currenciesList.map((j:any) => j.sourceCurrency));
            }
            if(details){
                dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
                //get vailable liquidity
                await sc.getAvailableLiquidity(dispatch,details?.address, details?.currency)
                const allowance = await sc.checkAllowance(dispatch,details.currency,'5', targetNet);
                dispatch(addAction(Actions.CHECK_ALLOWANCE,{value: allowance}))
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
    },
    onSwap: async (
        amount:string,balance:string,currency:string,targetNet: string,
        v: (v:string)=>void,y: (v:string)=>void,allowanceRequired,showModal: () => void
        ) => {
        try {
            const client = inject<TokenBridgeClient>(TokenBridgeClient);        
            ValidationUtils.isTrue(!(Number(balance) < Number(amount) ),'Not anough balance for this transaction');
            const res = await client.swap(dispatch,currency, amount, targetNet);
           
            if( res?.status === 'success' ){
                if(allowanceRequired){
                    dispatch(addAction(Actions.APPROVAL_SUCCESS, { }));
                    const allowance = await client.checkAllowance(dispatch,currency,'5', targetNet);
                    if(allowance){
                        y('Approval Successful, You can now go on to swap your transaction.');
                        dispatch(addAction(Actions.CHECK_ALLOWANCE,{value: false}))
                    }
                }else{
                    y('Swap Successful, Kindly View Withdrawal Items for item checkout.');
                    dispatch(addAction(Actions.SWAP_SUCCESS, {message: res.status,swapId: res.txId, itemId: res.itemId }));
                    setTimeout(
                       () => showModal()
                    ,1000)
                    showModal()
                    return
                }
            }
            v('error occured')
        }catch(e) {
            if(!!e.message){
                dispatch(addAction(TokenBridgeActions.AUTHENTICATION_FAILED, {message: e.message }));
            }
        }finally {
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);
            const res = await sc.getUserWithdrawItems(dispatch,currency);  
            if(res.withdrawableBalanceItems.length > 0){
                dispatch(addAction(Actions.WITHDRAWAL_ITEMS_FETCHED,{items: res.withdrawableBalanceItems}));
            } 
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    executeWithrawItem: async (item:UserBridgeWithdrawableBalanceItem,success,error) => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);
            const res = await sc.withdraw(dispatch,item);
            if(!!res){
                success('Withdrawal was Successful')   
                return;
            }
            error('Withdrawal failed');
        }catch(e) {
            if(!!e.message){
                dispatch(addAction(TokenBridgeActions.AUTHENTICATION_FAILED, {message: e.message }));
            }
        }finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    updatePendingWithrawItems: async () => {
        try {
            await IocModule.init(dispatch);
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);
            const connect = inject<Connect>(Connect);
            const network = connect.network() as any;
            const items = await sc.getUserWithdrawItems(dispatch,network);
            if(items.withdrawableBalanceItems.length > 0){
                if(items.withdrawableBalanceItems){
                    const pendingItems = items.withdrawableBalanceItems.filter((e:any) => e.used === 'pending');
                    if(pendingItems.length > 0){
                        pendingItems.forEach(
                            async (item:UserBridgeWithdrawableBalanceItem) => {
                                if(item.used === 'pending'){
                                    await sc.withdrawableBalanceItemUpdateTransaction(dispatch,item.receiveTransactionId,item.useTransactions[0].id)
                                }
                            }
                        );
                        const items = await sc.getUserWithdrawItems(dispatch,network);
                        if(items.withdrawableBalanceItems.length > 0){
                            dispatch(addAction(Actions.WITHDRAWAL_ITEMS_FETCHED,{items: items.withdrawableBalanceItems}));
                        }
        
                    }
                }
            }
         
        }catch(e) {
            if(!!e.message){
                dispatch(addAction(TokenBridgeActions.AUTHENTICATION_FAILED, {message: e.message }));
            }
        }finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    checkTxStatus: async (txId:string,sendNetwork:string,timestamp:number) => {
        try {
            await IocModule.init(dispatch);
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);
            const res = await sc.checkTxStatus(dispatch,txId,sendNetwork,timestamp);
            if(res){
                return res;
            }
            return '';
        }catch(e) {
            if(!!e.message){
                dispatch(addAction(TokenBridgeActions.AUTHENTICATION_FAILED, {message: e.message }));
            }
        }finally {
        }
    },
    checkifItemIsCreated: async (itemId:string) => {
        try {
            await IocModule.init(dispatch);
            await IocModule.init(dispatch);
            const sc = inject<TokenBridgeClient>(TokenBridgeClient);
            const connect = inject<Connect>(Connect);
            const network = connect.network() as any;
            const items = await sc.getUserWithdrawItems(dispatch,network);
            if(items.withdrawableBalanceItems.length > 0){
                const findMatch = items.withdrawableBalanceItems.filter((e:any)=>e.receiveTransactionId === itemId);
                console.log(findMatch,'matches');
                if(findMatch.length > 0){
                    dispatch(addAction(Actions.WITHDRAWAL_ITEMS_FETCHED,{items: items.withdrawableBalanceItems}));
                    return 'created'
                }
            }
            return '';
        }catch(e) {
            if(!!e.message){
                dispatch(addAction(TokenBridgeActions.AUTHENTICATION_FAILED, {message: e.message }));
            }
            
        }finally {
        }
    },
    openPanelHandler: () => {
        dispatch(addAction(Actions.TRIGGER_PANEL, {}));
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
    allowanceRequired: false,
    availableLiquidity: '0',
    currenciesDetails: {},
    panelOpen: false,
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
                baseNetwork: action.payload.pairedAddress.pair?.network1,
                initialised: true
            }
        case TokenBridgeActions.BRIDGE_AVAILABLE_LIQUIDITY_FOR_TOKEN:
            return {...state,availableLiquidity: action.payload.liquidity}
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
                ...state,currenciesDetails: action.payload.value[0],selectedToken: ''
            }
        case Actions.SWAP_SUCCESS:
            return {...state,message: action.payload.message,messageType: 'success', amount: '',swapId: action.payload.swapId,itemId: action.payload.itemId}
        case Actions.APPROVAL_SUCCESS:
            return {...state,message: action.payload.message,messageType: 'success'}
        case TokenBridgeActions.AUTHENTICATION_FAILED:
            return {
                ...state,message: action.payload.message,messageType: 'error', amount: ''
            }
        case Actions.WITHDRAWAL_ITEMS_FETCHED:
            return {...state, userWithdrawalItems: action.payload.items.reverse()}
        case Actions.DISCONNECT:
            return {...state, amount: '0',selectedToken: ''}
        case Actions.CHECK_ALLOWANCE:
            return {...state, allowanceRequired: action.payload.value}
        case Actions.TRIGGER_PANEL:
            return {...state, panelOpen: !state.openPanel}
        default:
            return state;
    }
}

export const Swap = ({
    mapStateToProps,
    mapDispatchToProps,
    reduce
})