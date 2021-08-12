import React,{Dispatch, useEffect, useReducer} from 'react';
import { UnifyreExtensionKitClient } from 'unifyre-extension-sdk';
import { Connect } from 'unifyre-extension-web3-retrofit/dist/contract/Connect';
import { WalletConnectWeb3Provider } from 'unifyre-extension-web3-retrofit/dist/contract/WalletConnectWeb3Provider';
import { AppUserProfile } from 'unifyre-extension-sdk/dist/client/model/AppUserProfile';
import { ValidationUtils } from 'ferrum-plumbing';
import { AnyAction } from 'redux';
import { CurrencyList } from 'unifyre-extension-web3-retrofit';

export const ConnectActions = {
    CONNECTION_SUCCEEDED: 'CONNECTION_SUCCEEDED',
    CONNECTION_FAILED: 'CONNECTION_FAILED',
    DISCONNECT: 'DISCONNECT',
    CONNET_CLEAR_ERROR: 'CONNET_CLEAR_ERROR',
    USER_DATA_RECEIVED: 'USER_DATA_RECEIVED',
}

export const DEFAULT_TOKEN_FOR_WEB3_MODE = {
    4: 'RINKEBY:0x93698a057cec27508a9157a946e03e277b46fe56',
    1: 'ETHEREUM:0xe5caef4af8780e59df925470b050fb23c43ca68c',
    97: 'BSC_TESTNET:0xae13d989dac2f0debff460ac112a837c89baa7cd',
    56: 'BSC:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    137: 'POLYGON:0xd99bafe5031cc8b345cb2e8c80135991f12d7130'
};

const Actions = ConnectActions;

type Connector = () => Promise<boolean>;

export interface IConnectDpendencies {
    client: UnifyreExtensionKitClient;
    connect: Connect;
    currencyList: CurrencyList;
    provider: WalletConnectWeb3Provider;
}

export interface IConnectOwnProps {
    onConnect: () => Promise<boolean>;
    onConnectionFailed: (e: Error) => void;
    appInitialized: boolean;
}

export interface IConnectViewProps {
    connected: boolean;
    address: string;
    error?: string;
    onClick: () => void;
}

export interface IConnectProps extends IConnectViewProps {
    dep: IConnectDpendencies,
    View: (props: IConnectViewProps) => any;
}

export interface IConnectDispatch {
    onUserDataReceived: (userProfile: AppUserProfile) => void;
    onDisconnected: () => void;
}

interface ConnectState {
    connected: boolean;
    error?: string;
}

interface ConnectButtonDispatch {
    metamaskConnect: (dep: IConnectDpendencies,
        onUserDataReceived: (up: AppUserProfile) => void,
        onDisconnect: () => void,
        onConnect: Connector, onError: (e: Error) => void) => void;
    clearError: () => void;
    wcConnect: (dep: IConnectDpendencies,
        onUserDataReceived: (up: AppUserProfile) => void,
        onDisconnect: () => void,
        onConnect: Connector, onError: (e: Error) => void, isCached: boolean) => void;
    onDisconnect: (dep: IConnectDpendencies,
        onDisconnect: () => void,
        ) => void;
}

async function doConnect(dispatch: Dispatch<AnyAction>,
    dep: IConnectDpendencies,
    onDisconnected: () => void,
    onError: (e: Error) => void,
    connector: () => Promise<boolean>,
    onUserDataReceived: (u: AppUserProfile) => void,
    isAutoConnect: boolean,
    ) {
    try {
        if (isAutoConnect && !dep.provider.isCached()) {
            return; // Dont try to connect if we are not cached.
        }
        dep.connect.setProvider(dep.provider);
        await dep.client.signInWithToken('');
        const net = await dep.connect.getProvider()!.netId();
        const network = await dep.connect.network()
        const newNetworkCurrencies = (dep.currencyList.get() || []).filter(c => c.startsWith(network || 'NA'));
        if (net && newNetworkCurrencies.length == 0) {
            const defaultCur = (DEFAULT_TOKEN_FOR_WEB3_MODE as any)[net as any];
            console.log(`Connected to net id ${net} with no defined currency: ${defaultCur}`);
            dep.currencyList.set([defaultCur]);
        }
        
        // Subscribe to session disconnection
        dep.connect.getProvider()!.addEventListener('disconnect', (reason: string) => {
            console.log('DISCONNECTED FROM WALLET CONNECT', reason);
            dispatch({type: Actions.DISCONNECT, payload: {}});
            onDisconnected();
        });
        const res = await connector();
        console.log('CONNECTEOR RETURNED!', res);
        if (res) {
            const userProfile = await dep.client.getUserProfile();
            onUserDataReceived(userProfile);
            console.log(userProfile,'user--profile')
            dispatch({type: Actions.CONNECTION_SUCCEEDED, payload: {}});
        } else {
            dep.connect.getProvider()?.disconnect();
        }
    }catch(e) {
        console.error('wsConnect', e);
        if (e) {
            try {
                console.log('Disconnecting failed connection');
                await dep.provider.disconnect();
            } catch (de) {
                console.error('Error disconnecting provider ', de);
            }
            dispatch({type: Actions.CONNECTION_FAILED, payload:
                { message: `Connection failed ${e.message}` }});
            onError(e);
        }
    }
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
    metamaskConnect: async (dep: IConnectDpendencies,
            onUserDataReceived,
            onDisconnected,
            connector, onError) => {
        if (!dep || !dep.client) { return; }
        try {
            await dep.client.signInWithToken('');
            const res = await connector();
            if (res) {
                const userProfile = await dep.client.getUserProfile();
                onUserDataReceived(userProfile);
                  console.log('popopret',userProfile)
                dispatch({type: Actions.CONNECTION_SUCCEEDED, payload: {}});
            } else {
                const e = new Error('Connection cannot be completed');
                dispatch({type: Actions.CONNECTION_FAILED, payload:
                    { message: e.message }});
                onError(e);
            }
        } catch(e) {
            dispatch({type: Actions.CONNECTION_FAILED, payload:
                { message: `Connection failed ${e.message}` }});
            onError(e);
        }
    },
    clearError: () => {
        dispatch({type: Actions.CONNET_CLEAR_ERROR, payload: { }});
    },
    wcConnect: async (
            dep: IConnectDpendencies,
            onUserDataReceived,
            onDisconnected,
            connector, onError, isCached) =>{
        if (!dep || !dep.client) { return; }
        console.log('ABOUT TO CALL DO CONNECT')
        await doConnect(dispatch, dep, onDisconnected, onError, connector, onUserDataReceived,
            isCached);
    },
    onDisconnect: async (dep: IConnectDpendencies,
            onDisconnected,
        ) => {
        if (!dep || !dep.client) { return; }
        await dep.connect.getProvider()!.disconnect();
        dispatch({type: Actions.DISCONNECT, payload: {}});
        onDisconnected();
    }
} as ConnectButtonDispatch);

function connectButtonReduce(state: ConnectState, action: any) {
    switch(action.type) {
        case Actions.CONNECTION_SUCCEEDED:
            return { ...state, connected: true, error: undefined };
        case Actions.CONNECTION_FAILED:
            return { ...state, connected: false, error: action.payload.message };
        case Actions.DISCONNECT: 
            return {...state, connected: false};
        case Actions.CONNET_CLEAR_ERROR:
            return {...state, connected: false, error: ''};
        default:
            return state;
    }
}

const AUTO_CON = { tried: false };

export function ConnectButtonWapper(props: IConnectProps&IConnectDispatch&IConnectOwnProps) {
    const [state, dispatch] = useReducer(connectButtonReduce, { connected: false });
    const {appInitialized, } = props;
    const connector = () => {
        disper.wcConnect(props.dep,
                            props.onUserDataReceived,
                            props.onDisconnected,
                            props.onConnect, props.onConnectionFailed, true);
    }
    const {connected} = state;
    useEffect(() => {
        if (AUTO_CON.tried) return;
        if (appInitialized && !connected) {
            AUTO_CON.tried = true;
            connector();
        }
    },[connector, appInitialized, connected])
    const disper = mapDispatchToProps(dispatch);
    ValidationUtils.isTrue(!!props.View, '"View" must be set');

    return (
        <>
            <props.View
                connected={props.connected} address={props.address} error={props.error}
                onClick={() => {
                    if (props.connected) {
                        disper.onDisconnect(props.dep, props.onDisconnected);
                    } else {
                        disper.wcConnect(props.dep,
                            props.onUserDataReceived,
                            props.onDisconnected,
                            props.onConnect, props.onConnectionFailed, false);
                    }
                }}
            />
        </>
       
    );
}