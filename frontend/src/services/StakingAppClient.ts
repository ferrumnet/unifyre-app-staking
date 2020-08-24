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
    CONTRACT_SELECTED: 'CONTRACT_SELECTED'
};

const Actions = StakingAppServiceActions;

export class StakingAppClient implements Injectable {
    private jwtToken: string = '';
    constructor(
        private client: UnifyreExtensionKitClient,
    ) { }

    __name__() { return 'StakingAppClient'; }

    async signInToServer(dispatch: Dispatch<AnyAction>): Promise<AppUserProfile|undefined> {
        const token = this.getToken(dispatch);
        if (!token) { return; }
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
            let currency = userProfile.accountGroups[0].addresses[0].currency;
            ValidationUtils.isTrue(!!currency, "Error getting user profile data. You may have no ERC-20 tokens activated in the wallet.");
            const stakingData = await this.api({
                    command: 'getStakingsForToken', data: {currency}, params: [] } as JsonRpcRequest);
            ValidationUtils.isTrue(!!stakingData, 'Error loading staking dashboard');
            dispatch(addAction(Actions.AUTHENTICATION_COMPLETED, { }));
            dispatch(addAction(Actions.USER_DATA_RECEIVED, { userProfile }));
            dispatch(addAction(Actions.STAKING_DATA_RECEIVED, { stakingData }));
            return userProfile;
        } catch (e) {
            console.error('Error sigining in', e);
            dispatch(addAction(Actions.AUTHENTICATION_FAILED, { message: 'Could not connect to Unifyre' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'signInToServer' }));
        }
    }

    async selectStakingContract(dispatch: Dispatch<AnyAction>, network: string,
            contractAddress: string, userAddress: string): Promise<[UserStake,{}]|undefined> {
        const token = this.getToken(dispatch);
        if (!token) { return; }
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

    private async refreshStakeEvents(dispatch: Dispatch<AnyAction>, events: StakeEvent[]) {
        try {
            const pendingTxs = events.filter(e => e.transactionStatus !== 'pending')
                .map(tx => tx.stakeTxId);
            if (!!pendingTxs.length) {
                const { updtedEvents } = await this.api({
                    command: 'updateStakingEvents', data: { txIds: pendingTxs }, params: []});
                if (updtedEvents || updtedEvents.length) {
                    dispatch(addAction(Actions.USER_STAKE_EVENTS_UPDATED, { updtedEvents }));
                }
            }
        } catch (e) {
            console.error('Error updating staking events', e);
        }
    }

    private getToken(dispatch: Dispatch<AnyAction>) {
        const storedToken = localStorage.getItem('SIGNIN_TOKEN');
        const token = Utils.getQueryparam('token') || storedToken;
        if (!!token && token !== storedToken) {
            localStorage.setItem('SIGNIN_TOKEN', token!);
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
        ) {
        try {
            ValidationUtils.isTrue(new Big(amount).gt(new Big('0')), 'Amount must be positive');
            ValidationUtils.isTrue(new Big(balance).gte(new Big(amount)), 'Not enough balance');
            dispatch(addAction(CommonActions.WAITING, { source: 'stakeSignAndSend' }));
            const token = this.getToken(dispatch);
            if (!token) { return; }
            const {requestId} = await this.api({
                command: 'stakeTokenSignAndSend', data: {amount, network, contractAddress, userAddress}, params: []} as JsonRpcRequest) as {requestId: string};
            if (!requestId) {
                dispatch(addAction(Actions.STAKING_FAILED, { message: 'Could not send a sign request.' }));
            }
            const response = await this.client.getSendTransactionResponse(requestId);
            console.log('RESPONSE FROM SERVER?', response);
            //@ts-ignore
            if (response.rejected) {
                throw new Error((response as any).reason || 'Request was rejected');
            }
            //@ts-ignore
            const transactionIds = (response.response || []).map(r => r.transactionId);  
            console.log('Received transaction IDs', transactionIds);
           
            /* TODO: Add functionality to record transaction IDs and staking attempts.
            if (transactionIds) {
                const res = await this.api({
                    command: 'saveStakingTransactions', data: { transactionIds }, params: []
                } as JsonRpcRequest) as {requestId: string};
                ValidationUtils.isTrue(!!res, 'Error updating user staking data');
                return //userstakedata
            } else {
                // failed
            }      
             */
            return transactionIds;
        } catch (e) {
            console.error('Error signAndSend', e);
            dispatch(addAction(Actions.STAKING_FAILED, { message: 'Could send a sign request. ' + e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'signAndSend' }));
        }
    }

    private async api(req: JsonRpcRequest): Promise<any> {
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
