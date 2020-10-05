import React,{useEffect,useContext} from 'react';
import {ThemeContext} from 'unifyre-react-helper';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { UnifyreExtensionKitClient } from 'unifyre-extension-sdk';
import { addAction, CommonActions } from '../common/Actions';
import { inject } from '../common/IocModule';
import { RootState, Web3ConnectionState } from '../common/RootState';
// @ts-ignore
import { StakingAppClient } from '../services/StakingAppClient';
import { useAlert } from 'react-alert';
import { StakingAppServiceActions } from "./../services/StakingAppClient";
import {
    WebThemedButton
    // @ts-ignore
} from 'desktop-components-library';

const Actions = {
}

interface ConnectProps extends Web3ConnectionState {
}

interface ConnectDispatch {
    onConnect: () => void;
    clearError: () => void;
}

export function mapStateToProps(state: RootState): ConnectProps {
    return state.data.connection;
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onConnect: async () => {
        const client = inject<UnifyreExtensionKitClient>(UnifyreExtensionKitClient);
        try {
            await client.signInWithToken('');
            dispatch(addAction(CommonActions.CONNECTION_SUCCEEDED, {}));
            const sc = inject<StakingAppClient>(StakingAppClient);
            await sc.signInToServer(dispatch);
        } catch(e) {
            dispatch(addAction(CommonActions.CONNECTION_FAILED, { message: `Connection failed ${e.message}` }))
        }
    },
    clearError: () => {
        dispatch(addAction(CommonActions.CLEAR_ERROR, {}))
    }
} as ConnectDispatch);

export function connectButtonReduce(state: Web3ConnectionState = { connected: false,error: '' }, action: AnyAction) {
    switch(action.type) {
        case CommonActions.CONNECTION_SUCCEEDED:
            return { connected: true, error: undefined };
        case CommonActions.CONNECTION_FAILED:
            return { connected: false, error: action.payload.message };
        case CommonActions.CLEAR_ERROR:
            return {connected: false, error: ''}
        case StakingAppServiceActions.AUTHENTICATION_FAILED:
            return {connected: false, error: action.payload.message.split('(')[0]}
        case StakingAppServiceActions.GET_STAKING_CONTRACT_FAILED:
            return {error: action.payload.message.split('(')[0]}
        default:
            return state;
    }
}

function ConnectButton(props: ConnectProps&ConnectDispatch) {
    const theme = useContext(ThemeContext);   
    const styles = themedStyles(theme);
    const alert = useAlert();

    useEffect(() => {
        if(props.error!='' && props.error!=null){
            alert.error(props.error)
            props.clearError()
        }
    }, [props.error]);
    
    // TODO: Show error
    return (
             <WebThemedButton
                text={props.connected ? 'Connected' : 'Connect'} 
                disabled={props.connected}
                onClick={props.onConnect} 
                highlight={false}
                customStyle={styles.btnStyle}
            />
       
    );
}

//@ts-ignore
const themedStyles = (theme) => ({
    btnStyle: {
        padding: '1rem'
    }
})

export const ConnectButtonContainer = connect(
  mapStateToProps, mapDispatchToProps)(ConnectButton);
