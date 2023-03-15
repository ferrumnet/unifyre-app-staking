import { Container, Injectable } from "ferrum-plumbing";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { UnifyreExtensionKitClient } from "unifyre-extension-sdk";
import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { Connect, CurrencyList, WalletConnectWeb3Provider,UnifyreExtensionWeb3Client } from "unifyre-extension-web3-retrofit";
import { ConnectActions, ConnectButtonWapper, IConnectDispatch,
    IConnectDpendencies, IConnectOwnProps, IConnectProps } from "./Connect";
import { Web3ModalProvider } from 'unifyre-extension-web3-retrofit/dist/contract/Web3ModalProvider';
import {inject5} from './types';
import {StakingAppClient} from './../services/StakingAppClient';

export interface UserDataState {
    profile: AppUserProfile;
    connectionError?: string;
}

export interface ConnectorContainerProps {
    dataSelector: (state: any) => UserDataState;
}

export interface ConnectorContainerOwnDispatch extends IConnectOwnProps {
}

const defaultAppUserPofile = {
    accountGroups: [ {addresses: [{}] } ],
} as any;

export class ConnectorContainer implements Injectable {
    private control: any;
    constructor(
        
        ) {
    }

    __name__() { return 'ConnectorContainer'; }

    mapStateToProps(state: any, ownProps: ConnectorContainerProps&ConnectorContainerOwnDispatch):
            IConnectProps {
        const st = ownProps.dataSelector(state);
        const addr = ((st?.profile?.accountGroups || [] as any)[0].addresses || [])[0] || {} as any;
                const [client, connect, currencyList,provider,ApiClient] = inject5<UnifyreExtensionWeb3Client, Connect, CurrencyList, Web3ModalProvider,StakingAppClient>( UnifyreExtensionWeb3Client, Connect, CurrencyList, 'Web3ModalProvider',StakingAppClient);

        return ({
            dep : {
                client: client, connect: connect,currencyList: currencyList, provider: provider,ApiClient:ApiClient
            } as IConnectDpendencies,
            connected: !!st.profile && !!st.profile.userId,
            address: addr?.humanReadableAddress || addr?.address,
            error: st.connectionError,
            View: this.control,
        } as IConnectProps);
    }

    mapDispatchToProps(dispatch: any, ownDispatch: ConnectorContainerProps&ConnectorContainerOwnDispatch): IConnectDispatch {
        return ({
            onUserDataReceived: userProfile => dispatch({type: ConnectActions.USER_DATA_RECEIVED,
                payload: { userProfile }}),
            onDisconnected: () => dispatch({type: ConnectActions.DISCONNECT, payload: {}}),
        } as IConnectDispatch);
    }

    static Connect(container: Container | undefined, control: any) {
        if (!container) { return control; }
        try {
            const conti = container.get<ConnectorContainer>(ConnectorContainer);
            conti.control = control;
            conti.mapStateToProps = conti.mapStateToProps.bind(conti);
            conti.mapDispatchToProps = conti.mapDispatchToProps.bind(conti);
            return connect(conti.mapStateToProps, conti.mapDispatchToProps)(ConnectButtonWapper);
        } catch(e) {
            console.info(`Could not get ConnectorContainer to render stuff`, e);
            // Not initialized
            return control;
        }
    }

    static reduceData(state: UserDataState = { profile: defaultAppUserPofile, } as UserDataState,
        action: AnyAction) {
        switch (action.type) {
            case ConnectActions.USER_DATA_RECEIVED:
                const {userProfile} = action.payload;
                return {...state, profile: userProfile };
            case ConnectActions.DISCONNECT:
                return {...state, profile: defaultAppUserPofile};
            case ConnectActions.CONNECTION_FAILED:
                return {...state, connectionError: action.payload.message};
            default:
                return state;
        }
    }
}