import React,{Dispatch, useContext, useReducer} from 'react';
import {ThemeContext} from 'unifyre-react-helper';
import { UnifyreExtensionKitClient } from 'unifyre-extension-sdk';
import {
    WebThemedButton
    // @ts-ignore
} from 'desktop-components-library';
import { useBoolean } from '@uifabric/react-hooks';
import {ConnectModal} from './walletConnect/Modal';
import { Container } from 'ferrum-plumbing';
import { Connect } from 'unifyre-extension-web3-retrofit/dist/contract/Connect';
import { WalletConnectWeb3Provider } from 'unifyre-extension-web3-retrofit/dist/contract/WalletConnectWeb3Provider';

const Actions = {
    CONNECTION_SUCCEEDED: 'CONNECTION_SUCCEEDED',
    CONNECTION_FAILED: 'CONNECTION_FAILED',
    DISCONNECT: 'DISCONNECT',
    CLEAR_ERROR: 'CLEAR_ERROR',
}

type Connector = () => Promise<boolean>;

interface ConnectButtonProps {
    container?: Container;
    onConnect: Connector;
    onConnectionFailed: (e: Error) => void;
}

interface ConnectState {
    connected: boolean;
    error?: string;
}

interface ConnectButtonDispatch {
    metamaskConnect: (c: Container | undefined, onConnect: Connector, onError: (e: Error) => void) => void;
    clearError: () => void;
    wcConnect: (c: Container | undefined, onConnect: Connector, onError: (e: Error) => void) => void;
    onDisconnect: (c: Container | undefined) => void;
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
    metamaskConnect: async (c, connector, onError) => {
        if (!c) { return; }
        const client = c.get<UnifyreExtensionKitClient>(UnifyreExtensionKitClient);
        try {
            await client.signInWithToken('');
            const res = await connector();
            if (res) {
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
        dispatch({type: Actions.CLEAR_ERROR, payload: { }});
    },
    wcConnect: async (c, connector, onError) =>{
        if (!c) { return; }
        const client = c.get<UnifyreExtensionKitClient>(UnifyreExtensionKitClient);
        try {
            const connect = c.get<Connect>(Connect)
            let provider = c.get<WalletConnectWeb3Provider>(WalletConnectWeb3Provider);
            connect.setProvider(provider);
            await client.signInWithToken('');
            // Subscribe to session disconnection
            provider.addEventListener('disconnect', (reason: string) => {
                console.log('DISCONNECTED FROM WALLET CONNECT', reason);
                dispatch({type: Actions.DISCONNECT, payload: {}});
            });
            const res = await connector();
            if (res) {
                dispatch({type: Actions.CONNECTION_SUCCEEDED, payload: {}});
            }
        }catch(e) {
            console.error('wsConnect', e);
            dispatch({type: Actions.CONNECTION_FAILED, payload:
                { message: `Connection failed ${e.message}` }});
            onError(e);
        }
    },
    onDisconnect: async (c) => {
        if (!c) {return}
        const con = c!.get<Connect>(Connect)!;
        await con.getProvider()!.disconnect();
        dispatch({type: Actions.DISCONNECT, payload: {}});
    }
} as ConnectButtonDispatch);

function connectButtonReduce(state: ConnectState = {connected: false, error: '' }, action: any) {
    switch(action.type) {
        case Actions.CONNECTION_SUCCEEDED:
            return { connected: true, error: undefined };
        case Actions.CONNECTION_FAILED:
            return { connected: false, error: action.payload.message };
        case Actions.DISCONNECT: 
            return {connected: false}
        case Actions.CLEAR_ERROR:
            return {connected: false, error: ''}
        default:
            return state;
    }
}

export function ConnectButton(props: ConnectButtonProps) {
    const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
    const [state, dispatch] = useReducer(connectButtonReduce, { connected: false, });
    const disper = mapDispatchToProps(dispatch);
    const theme = useContext(ThemeContext);   
    const styles = themedStyles(theme);

    return (
        <>
             <WebThemedButton
                text={state.connected ? 'Connected' : 'Connect'} 
                disabled={state.connected}
                onClick={showModal} 
                highlight={false}
                customStyle={styles.btnStyle}
            />
            {
                state.connected && 
                    <WebThemedButton
                        text={'Disconnect'} 
                        disabled={false}
                        onClick={() => disper.onDisconnect(props.container)} 
                        highlight={false}
                        customStyle={styles.btnStyle}
                    />
            }
            <ConnectModal 
                showModal={showModal} 
                hideModal={hideModal} 
                isModalOpen={isModalOpen}
                metaMaskConnect={() => {
                    hideModal();
                    disper.metamaskConnect(props.container, props.onConnect, props.onConnectionFailed);
                }}
                walletConnect={() => {
                    hideModal();
                    disper.wcConnect(props.container, props.onConnect, props.onConnectionFailed);
                }}
                connected={state.connected}
            />
        </>
       
    );
}

//@ts-ignore
const themedStyles = (theme) => ({
    btnStyle: {
        padding: '1rem'
    }
});
