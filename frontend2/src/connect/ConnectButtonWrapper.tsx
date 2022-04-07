import React,{useEffect} from 'react';
import { Connect } from 'unifyre-extension-web3-retrofit/dist/contract/Connect';
import { Networks, ValidationUtils } from 'ferrum-plumbing';
import { CurrencyList, UnifyreExtensionWeb3Client } from 'unifyre-extension-web3-retrofit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { addressesForUser, addressForUser, dummyAppUserProfile } from './types';
import {RootState} from './../common/RootState';

import { useDispatch, useSelector } from 'react-redux';
import { BRIDGE_NETWORKS, inject, inject3, inject5, } from './types';
import { AddressDetails } from 'unifyre-extension-sdk/dist/client/model/AppUserProfile';
import { StakingAppClient } from '../services/StakingAppClient';
import { Web3ModalProvider } from 'unifyre-extension-web3-retrofit/dist/contract/Web3ModalProvider';

export const connectSlice = createSlice({
    name: 'connect',
    initialState: {
        user: dummyAppUserProfile,
    } as any,
    reducers: {
        connectionSucceeded: (state, action) => {
            const {userProfile} = action.payload;
            state.user = userProfile;
            state.connectionError = undefined;
        },
        userProfileUpdated: (state, action) => {
            const {userProfile} = action.payload;
            state.user = userProfile;
            state.connectionError = undefined;
        },
        reconnected: (state, action) => {
            const {userProfile} = action.payload;
            state.user = userProfile;
            state.connectionError = undefined;
        },
        connectionFailed: (state, action) => {
            state.connectionError = action.payload.message || action.payload.toString();
        },
        disconnect: state => {
            state.connectionError = undefined;
            state.user = dummyAppUserProfile;
        },
        clearError: state => {
            state.connectionError = undefined;
        }
    }});

const Actions = connectSlice.actions;

export interface IConnectOwnProps {
    View: (props: IConnectViewProps) => any;
}

export interface IConnectViewProps {
    connected: boolean;
    network: string;
    address: string;
    balances: AddressDetails[];
    error?: string;
    onClick: () => void;
}

export const onDisconnect = createAsyncThunk('connect/onDisconnect',
    async (payload: {}, ctx) => {
    const connect = inject<Connect>(Connect);
    console.log('Disconnecting...');
    await connect.getProvider()!.disconnect();
    ctx.dispatch(Actions.disconnect());
});

export const reConnect = createAsyncThunk('connect/reConnect', async (payload: {}, ctx) => {
    const [client, connect, api] = inject3<UnifyreExtensionWeb3Client, Connect, StakingAppClient>(
        UnifyreExtensionWeb3Client, Connect, StakingAppClient);
    await connect.reset();
    const userProfile = await client.getUserProfile();
    const res = await api.signInToServer2(userProfile);
    if (res) {
        ctx.dispatch(Actions.reconnected({userProfile}));
    } else {
        ctx.dispatch(onDisconnect({}));
    }
});

export const onConnect = createAsyncThunk('connect/onConnect',
    async (payload: {isAutoConnect: boolean}, ctx) => {
    const [client, connect, currencyList, api, provider] = 
        inject5<UnifyreExtensionWeb3Client, Connect, CurrencyList, StakingAppClient, Web3ModalProvider>(
            UnifyreExtensionWeb3Client, Connect, CurrencyList, StakingAppClient, 'Web3ModalProvider');
    try {
        if (payload.isAutoConnect && !provider.isCached()) {
            return; // Dont try to connect if we are not cached.
        }
        connect.setProvider(provider);
        await client.signInWithToken('');
        const net = await connect.getProvider()!.netId();
        const network = await connect.network();
        const newNetworkCurrencies = (currencyList.get() || []).filter(c => c.startsWith(network || 'NA'));
        if (net && newNetworkCurrencies.length == 0) {
            currencyList.set([...BRIDGE_NETWORKS].map(n => Networks.for(n).baseCurrency));
            console.log(currencyList.get(),'currencyList.get()currencyList.get()')
        }
        
        // Subscribe to session disconnection
        // console.log('Provider is...', connect.getProvider())
        connect.getProvider()!.addEventListener('disconnect', (reason: string) => {
            console.log('DISCONNECTED FROM WALLET CONNECT', reason);
            ctx.dispatch(Actions.disconnect());
        });
        connect.getProvider()!.addEventListener('change', () => {
            console.log('RECONNECTING');
            ctx.dispatch(reConnect({}));
        });
        const userProfile = await client.getUserProfile();
        console.log('hettttt')
        const res = await api.signInToServer2(userProfile);
        console.log(res,"resres")
        if (res) {
            console.log(userProfile,'userProfile')
            ctx.dispatch(Actions.connectionSucceeded({userProfile}));
        } else {
            connect.getProvider()?.disconnect();
        }
    } catch (e) {
        console.error('wsConnect', e);
        if (e) {
            try {
                console.log('Disconnecting failed connection !!', e);
                if (provider) {
                    await provider.disconnect();
                }
            } catch (de) {
                console.error('Error disconnecting provider ', de);
            }
            ctx.dispatch(Actions.connectionFailed({ message: `Connection failed ${(e as any).message}` }));
        }
    }
});

const AUTO_CON = { tried: false };

export function ConnectButtonWapper(props: IConnectOwnProps) {
    const dispatch = useDispatch();
    useSelector((state:any) => console.log(state))
    const connected = useSelector((state:any) => 
        !!state.data.account?.user?.userId);
    const address:any = useSelector((state:any) => 
        addressForUser(state.data.account?.user));
    const balances = useSelector((state:any) => 
        addressesForUser(state.data.account?.user));
    const error = useSelector((state:any) => 
        state.data.account.connectionError);
    
    const connector = async () => {
        dispatch(onConnect({isAutoConnect: true}));
    }
    useEffect(() => {
        if (AUTO_CON.tried) return;
        
            connector();
    },[connector, connected]);
    ValidationUtils.isTrue(!!props.View, '"View" must be set');

    return (
        <>
            <props.View
                connected={connected}
                address={address?.address || ''}
                balances={balances}
                network={address?.network || ''}
                error={error}
                onClick={() => {
                    if (connected) {
                        dispatch(onDisconnect({isAutoConnect: false}));
                    } else {
                        dispatch(onConnect({isAutoConnect: false}));
                    }
                }}
            />
        </>
    );
}