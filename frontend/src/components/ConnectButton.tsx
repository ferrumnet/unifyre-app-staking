import React from 'react';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { UnifyreExtensionKitClient } from 'unifyre-extension-sdk';
import { addAction } from '../common/Actions';
import { inject } from '../common/IocModule';
import { RootState } from '../common/RootState';
// @ts-ignore
import { ThemedButton } from 'unifyre-web-components';

const Actions = {
    CONNECTION_FAILED: 'CONNECTION_FAILED',
    CONNECTION_SUCCEEDED: 'CONNECTION_SUCCEEDED',
}

interface ConnectProps {
    connected: boolean;
    error?: string;
}

interface ConnectDispatch {
    onConnect: () => void;
}

function mapStateToProps(state: RootState): ConnectProps {
    return { connected: state.data.connection.conneted };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onConnect: async () => {
        const client = inject<UnifyreExtensionKitClient>(UnifyreExtensionKitClient);
        try {
            await client.signInWithToken('');
        } catch(e) {
            dispatch(addAction(Actions.CONNECTION_FAILED, { message: `Connection failed ${e.message}` }))
        }
    }
} as ConnectDispatch);

export function connectButtonReduce(state: ConnectProps = { connected: false }, action: AnyAction) {
    switch(action.type) {
        case Actions.CONNECTION_SUCCEEDED:
            return { connected: true, error: undefined };
        case Actions.CONNECTION_FAILED:
            return { connected: false, error: action.payload.message };
        default:
            return state;
    }
}

function ConnectButton(props: ConnectProps&ConnectDispatch) {
    return (
        <ThemedButton text='Connect' onPress={props.onConnect} />
    );
}

export const ConnectButtonContainer = connect(
  mapStateToProps, mapDispatchToProps)(ConnectButton);
