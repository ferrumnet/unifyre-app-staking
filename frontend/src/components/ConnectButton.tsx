import React from 'react';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { UnifyreExtensionKitClient } from 'unifyre-extension-sdk';
import { addAction, CommonActions } from '../common/Actions';
import { inject } from '../common/IocModule';
import { RootState, Web3ConnectionState } from '../common/RootState';
// @ts-ignore
import { ThemedButton } from 'unifyre-web-components';
import { StakingAppClient } from '../services/StakingAppClient';

const Actions = {
}

interface ConnectProps extends Web3ConnectionState {
}

interface ConnectDispatch {
    onConnect: () => void;
}

function mapStateToProps(state: RootState): ConnectProps {
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
    }
} as ConnectDispatch);

export function connectButtonReduce(state: Web3ConnectionState = { connected: false }, action: AnyAction) {
    switch(action.type) {
        case CommonActions.CONNECTION_SUCCEEDED:
            return { connected: true, error: undefined };
        case CommonActions.CONNECTION_FAILED:
            return { connected: false, error: action.payload.message };
        default:
            return state;
    }
}

function ConnectButton(props: ConnectProps&ConnectDispatch) {
    // TODO: Show error
    return (
        <ThemedButton
            text={props.connected ? 'Connected' : 'Connect'} 
            disabled={props.connected}
            onClick={props.onConnect} />
    );
}

export const ConnectButtonContainer = connect(
  mapStateToProps, mapDispatchToProps)(ConnectButton);
