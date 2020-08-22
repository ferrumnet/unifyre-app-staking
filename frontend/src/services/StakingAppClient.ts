import { Injectable, JsonRpcRequest, ValidationUtils, Network } from "ferrum-plumbing";
import { Dispatch, AnyAction } from "redux";
import { addAction, CommonActions } from "../common/Actions";
import { Utils } from "../common/Utils";
import { UnifyreExtensionKitClient, SendMoneyResponse } from 'unifyre-extension-sdk';
import { CONFIG } from "../common/IocModule";
import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { UserStake } from "../common/Types";

export const StakingAppServiceActions = {
    TOKEN_NOT_FOUND_ERROR: 'TOKEN_NOT_FOUND_ERROR',
    API_ERROR: 'API_ERROR',
    AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
    AUTHENTICATION_COMPLETED: 'AUTHENTICATION_COMPLETED',
    STAKING_CONTACT_RECEIVED: 'STAKING_CONTACT_RECEIVED',
    USER_STAKE_RECEIVED: 'USER_STAKE_RECEIVED',
    USER_DATA_RECEIVED: 'USER_DATA_RECEIVED',
    GET_STAKING_CONTRACT_FAILED: 'GET_STAKING_CONTRACT_FAILED',
    STAKING_DATA_RECEIVED: 'STAKING_DATA_RECEIVED',
    STAKING_FAILED: 'STAKING_FAILED',
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
            contractAddress: string, userAddress: string): Promise<UserStake|undefined> {
        const token = this.getToken(dispatch);
        if (!token) { return; }
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'selectStakingContract' }));
            const res = await this.api({
                command: 'getStakingContractForUser', data: {network, contractAddress, userAddress}, params: [] } as JsonRpcRequest);
            const { userStake, stakingContract } = res;
            if (!userStake) {
                dispatch(addAction(Actions.GET_STAKING_CONTRACT_FAILED, { message: 'Could not get the staking contract data' }));
                return;
            }
            dispatch(addAction(Actions.STAKING_CONTACT_RECEIVED, { stakingContract }));
            dispatch(addAction(Actions.USER_STAKE_RECEIVED, { userStake }));
            return userStake;
        } catch (e) {
            console.error('Error sigining in', e);
            dispatch(addAction(Actions.GET_STAKING_CONTRACT_FAILED, { message: 'Could get the staking contract data' + e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'selectStakingContract' }));
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
            ValidationUtils.isTrue(new Big(balance).gte(new Big(amount)), 'Not enough balance');
            dispatch(addAction(CommonActions.WAITING, { source: 'stakeSignAndSend' }));
            const token = this.getToken(dispatch);
            if (!token) { return; }
            const {requestId} = await this.api({
                command: 'stakeTokenSignAndSend', data: {amount, network, contractAddress, userAddress}, params: []} as JsonRpcRequest) as {requestId: string};
            if (!requestId) {
                dispatch(addAction(Actions.STAKING_FAILED, { message: 'Could not send a sign request.' }));
            }
            // TODO: Fix the response format in client
            // {"serverError":null,"data":{"requestId":"659ff5c5-5e6a-407a-835d-d43e8b64aee2","appId":"POOL_DROP","response":[{"transactionId":"0x4d6b570dea6d5940e4dd8ea09f930622593ff19a8b733c0deda0927dd3d7929e"},{"transactionId":"0xab28e8cadb0cd73e8f8788a89065f62cae06f746da44ef6147b900341cca8514"}]}}
            const response = await this.client.getSendTransactionResponse(requestId) as any;
            if (response.rejected) {
                throw new Error(response.reason || 'Request was rejected');
            }
            const transactionIds = (response.response as SendMoneyResponse[]).map(r => r.transactionId);  
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
            dispatch(addAction(Actions.STAKING_FAILED, { message: 'Could send a sign request.' + e.message || '' }));
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
