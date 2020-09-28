import { Injectable, JsonRpcRequest, ValidationUtils, Network } from "ferrum-plumbing";
import { Dispatch, AnyAction } from "redux";
import { addAction, CommonActions } from "../common/Actions";
import { Utils } from "../common/Utils";
import { UnifyreExtensionKitClient } from 'unifyre-extension-sdk';
import { CONFIG } from "../common/IocModule";
import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { StakeEvent, UserStake } from "../common/Types";
import { Big } from 'big.js';

export const StakingAppServiceActions = {
    TOKEN_NOT_FOUND_ERROR: 'TOKEN_NOT_FOUND_ERROR',
    API_ERROR: 'API_ERROR',
    AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
    AUTHENTICATION_COMPLETED: 'AUTHENTICATION_COMPLETED',
    STAKING_CONTACT_RECEIVED: 'STAKING_CONTACT_RECEIVED',
    USER_STAKE_RECEIVED: 'USER_STAKE_RECEIVED',
    USER_DATA_RECEIVED: 'USER_DATA_RECEIVED',
    USER_STAKE_EVENTS_RECEIVED: 'USER_STAKE_EVENTS_RECEIVED',
    USER_STAKE_EVENTS_UPDATED: 'USER_STAKE_EVENTS_UPDATED',
    GET_STAKING_CONTRACT_FAILED: 'GET_STAKING_CONTRACT_FAILED',
    STAKING_DATA_RECEIVED: 'STAKING_DATA_RECEIVED',
    STAKING_FAILED: 'STAKING_FAILED',
    UN_STAKING_FAILED: 'UN_STAKING_FAILED',
    CONTRACT_SELECTED: 'CONTRACT_SELECTED',
    STAKING_SUCCESS: 'STAKING_SUCCESS'
};

const Actions = StakingAppServiceActions;

function openUnifyre() {
    const w = window.open('https://app.unifyre.io', '_blank');
    setTimeout(() => { if (w) { w.close(); } }, 4000);
}

export class StakingAppClient implements Injectable {
    protected jwtToken: string = '';
    private token: string = '';
    constructor(
        protected client: UnifyreExtensionKitClient,
    ) { }

    __name__() { return 'StakingAppClient'; }

    async signInToServer(dispatch: Dispatch<AnyAction>): Promise<AppUserProfile|undefined> {
        const token = this.getToken(dispatch);
        if (!token) { return; }
        this.token = token!;
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'signInToServer' }));
            await this.client.signInWithToken(token);
            const res = await this.api({
                command: 'signInToServer', data: {token,symbol: 'FRM'}, params: [] } as JsonRpcRequest);
            const {userProfile, session } = res;
            if (!session) {
                dispatch(addAction(Actions.AUTHENTICATION_FAILED, { message: 'Could not connect to Unifyre' }));
                return;
            }
            this.jwtToken = session;
            return this.loadDataAfterSignIn(dispatch, userProfile);
        } catch (e) {
            console.error('Error sigining in', e);
            dispatch(addAction(Actions.AUTHENTICATION_FAILED, { message: 'Could not connect to Unifyre' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'signInToServer' }));
        }
    }

    async loadStakingsForToken(dispatch: Dispatch<AnyAction>, currency: string) {
        ValidationUtils.isTrue(!!currency, "Error getting user profile data. You may have no ERC-20 tokens activated in the wallet.");
        const stakingData = await this.api({
                command: 'getStakingsForToken', data: {currency}, params: [] } as JsonRpcRequest);
        ValidationUtils.isTrue(!!stakingData, 'Error loading staking dashboard');
        dispatch(addAction(Actions.STAKING_DATA_RECEIVED, { stakingData }));
    }

    protected async loadDataAfterSignIn(dispatch: Dispatch<AnyAction>, userProfile: AppUserProfile) {
        let currency = userProfile.accountGroups[0].addresses[0].currency;
        await this.loadStakingsForToken(dispatch, currency);
        const events = await this.api({
            command: 'getAllStakingEventsForUser', data: {currency}, params: [] } as JsonRpcRequest);
        dispatch(addAction(Actions.USER_STAKE_EVENTS_RECEIVED, { stakeEvents:events }));
        dispatch(addAction(Actions.AUTHENTICATION_COMPLETED, { }));
        dispatch(addAction(Actions.USER_DATA_RECEIVED, { userProfile }));
        return userProfile;
    }

    async selectStakingContract(dispatch: Dispatch<AnyAction>, network: string,
            contractAddress: string, userAddress: string): Promise<[UserStake,{}]|undefined> {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'selectStakingContract' }));
            const res = await this.api({
                command: 'getStakingContractForUser', data: {network, contractAddress, userAddress}, params: [] } as JsonRpcRequest);
            const [ userStake, stakingContract, stakeEvents ] = res;
            if (!userStake) {
                dispatch(addAction(Actions.GET_STAKING_CONTRACT_FAILED, { message: 'Could not get the staking contract data' }));
                return;
            }
            dispatch(addAction(Actions.STAKING_CONTACT_RECEIVED, { stakingContract }));
            dispatch(addAction(Actions.USER_STAKE_RECEIVED, { userStake }));
            dispatch(addAction(Actions.USER_STAKE_EVENTS_RECEIVED, { stakeEvents }));
            setTimeout(() => this.refreshStakeEvents(dispatch, stakeEvents), 1000);
            return userStake;
        } catch (e) {
            console.error('Error sigining in', e);
            dispatch(addAction(Actions.GET_STAKING_CONTRACT_FAILED, { message: 'Could get the staking contract data' + e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'selectStakingContract' }));
        }
    }

    async refreshStakeEvents(dispatch: Dispatch<AnyAction>, events: StakeEvent[]) {
        try {
            const pendingTxs = events.filter(e => e.transactionStatus === 'pending')
                .map(tx => tx.mainTxId);
            if (!!pendingTxs.length) {
                const updatedEvents = await this.api({
                    command: 'updateStakingEvents', data: { txIds: pendingTxs }, params: []});
                console.log('UPDATED EVENTS', updatedEvents)
                if (!!updatedEvents && updatedEvents.length) {
                    dispatch(addAction(Actions.USER_STAKE_EVENTS_UPDATED, { updatedEvents }));
                }
            }
        } catch (e) {
            console.error('Error updating staking events', e);
        }
    }

    protected getToken(dispatch: Dispatch<AnyAction>) {
        let storedToken: string|null = '';
        try {
            storedToken = localStorage.getItem('SIGNIN_TOKEN');
        } catch (e) { console.error('Reading local storage', e); }
        const token = Utils.getQueryparam('token') || this.token || storedToken;
        if (!!token && token !== storedToken) {
            try {
                localStorage.setItem('SIGNIN_TOKEN', token!);
            } catch(e) {
                console.error('Reading local storage', e);
            }
        }
        if (!token) {
            dispatch(addAction(Actions.TOKEN_NOT_FOUND_ERROR, {}));
            return;
        }
        return token;
    }

    async stakeSignAndSend(
        dispatch: Dispatch<AnyAction>, 
        amount: string,
        network: Network,
        contractAddress: string,
        userAddress: string,
        balance: string,
        ): Promise<string|undefined> {
        try {
            ValidationUtils.isTrue(new Big(amount).gt(new Big('0')), 'Amount must be positive');
            ValidationUtils.isTrue(new Big(balance).gte(new Big(amount)), 'Not enough balance');
            dispatch(addAction(CommonActions.WAITING, { source: 'stakeSignAndSend' }));
            const token = this.getToken(dispatch);
            if (!token) { return; }
            let {requestId, stakeEvent} = (await this.api({
                command: 'stakeTokenSignAndSend', data: {token, amount, network, contractAddress, userAddress},
                params: []}as JsonRpcRequest)) as {requestId: string, stakeEvent?: StakeEvent};
            if (!requestId) {
                dispatch(addAction(Actions.STAKING_FAILED, { message: 'Could not send a sign request.' }));
            }
            openUnifyre();
            await this.processRequest(dispatch, requestId);
            return 'success' as string;
        } catch (e) {
            console.error('Error signAndSend', e);
            dispatch(addAction(Actions.STAKING_FAILED, { message: 'Could send a sign request. ' + e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'signAndSend' }));
        }
    }

    async unstakeSignAndSend(
        dispatch: Dispatch<AnyAction>, 
        amount: string,
        network: Network,
        contractAddress: string,
        userAddress: string,
        ): Promise<string|undefined> {
        try {
            ValidationUtils.isTrue(new Big(amount).gt(new Big('0')), 'Amount must be positive');
            dispatch(addAction(CommonActions.WAITING, { source: 'unstakeSignAndSend' }));
            const token = this.getToken(dispatch);
            if (!token) { return; }
            let {requestId} = (await this.api({
                command: 'unstakeTokenSignAndSend', data: {
                    token, amount, network, contractAddress, userAddress},
                params: []}as JsonRpcRequest)) as {requestId: string, stakeEvent?: StakeEvent};
            if (!requestId) {
                dispatch(addAction(Actions.UN_STAKING_FAILED, { message: 'Could not send a sign request.' }));
            }
            openUnifyre();
            await this.processRequest(dispatch, requestId);
            return 'success' as string;
        } catch (e) {
            console.error('Error signAndSend', e);
            dispatch(addAction(Actions.UN_STAKING_FAILED, { message: 'Could send a sign request. ' + e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'signAndSend' }));
        }
    }


    async processRequest(dispatch: Dispatch<AnyAction>, 
        requestId: string) {
        const token = this.getToken(dispatch);
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'processRequest' }));
            const response = await this.client.getSendTransactionResponse(requestId);
            if (response.rejected) {
                throw new Error((response as any).reason || 'Request was rejected');
            }
            const txIds = (response.response || []).map(r => r.transactionId);
            const payload = response.requestPayload || {};
            console.log('RESPONSED IS ', response)
            const { amount, contractAddress, action } = payload;
            const res = await this.api({
                command: 'stakeEventProcessTransactions', data: {token, amount, eventType: action || 'stake',
                    contractAddress, txIds},
                params: []}as JsonRpcRequest) as {stakeEvent?: StakeEvent};
            const stakeEvent = res.stakeEvent;
            ValidationUtils.isTrue(!!stakeEvent, 'Error while getting the transaction! Your stake might have been executed. Please check etherscan for a pending stake transation');
            dispatch(addAction(Actions.USER_STAKE_EVENTS_UPDATED, { updatedEvents: [stakeEvent] }));
            dispatch(addAction(CommonActions.CONTINUATION_DATA_RECEIVED, {action,
                mainTxId: stakeEvent!.mainTxId}));
        } catch(e) {
            console.error('Error signAndSend', e);
            dispatch(addAction(CommonActions.CONTINUATION_DATA_FAILED, {message: 'Could send a sign request. ' + e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'signAndSend' }));
        }
    }

    protected async api(req: JsonRpcRequest): Promise<any> {
        try {
            const res = await fetch(CONFIG.poolDropBackend, {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify(req),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.jwtToken}`
                },
            });
            const resText = await res.text();
            if (Math.round(res.status / 100) === 2) {
                return resText ? JSON.parse(resText) : undefined;
            }
            const error = resText;
            let jerror: any;
            try {
                jerror = JSON.parse(error);
            } catch (e) {}
            console.error('Server returned an error when calling ', req, {
                status: res.status, statusText: res.statusText, error});
            throw new Error(jerror?.error ? jerror.error : error);
        } catch (e) {
            console.error('Error calling api with ', req, e);
            throw e;
        }
    }
}
