//@ts-nocheck
import { JsonRpcRequest, Network, ValidationUtils } from "ferrum-plumbing";
import { AnyAction, Dispatch } from "redux";
import { CustomTransactionCallRequest, UnifyreExtensionKitClient } from "unifyre-extension-sdk";
import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { addAction, CommonActions } from "../common/Actions";
import { StakingAppClient, StakingAppServiceActions } from "./StakingAppClient";
import { Big } from 'big.js';
import { logError } from "../common/Utils";
import { GroupInfo } from "../common/Types";
import { IocModule } from "../common/IocModule";
import { Connect, UnifyreExtensionWeb3Client } from "unifyre-extension-web3-retrofit";
import { inject } from "../connect/types";
const Actions = StakingAppServiceActions;

export class StakingAppClientForWeb3 extends StakingAppClient {
    
    async signInToServer(dispatch: Dispatch<AnyAction>): Promise<AppUserProfile|undefined> {
        dispatch(addAction(CommonActions.WAITING, { source: 'signInToServer' }));
        try {
            const userProfile = await this.client.getUserProfile();
            console.log('GOT USER PROF', {userProfile})
            const userAddress = userProfile.userId;
            const res = await this.api({
                command: 'signInUsingAddress', data: {userAddress}, params: [] } as JsonRpcRequest);
            const { unsecureSession } = res;
            if (!unsecureSession) {
                dispatch(addAction(Actions.AUTHENTICATION_FAILED, { message: 'Could not connect to backend' }));
                return;
            }
            this.jwtToken = unsecureSession;
            return this.loadDataAfterSignIn(dispatch, userProfile);
        } catch (e) {
            console.error('signInToServer', e)
            dispatch(addAction(Actions.AUTHENTICATION_FAILED, {
                message: 'Could not connect to network ' + e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'signInToServer' }));
        }
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
            ValidationUtils.isTrue(new Big(amount || '0').gt(new Big('0')), 'Amount must be positive');
            ValidationUtils.isTrue(new Big(balance || '0').gte(new Big(amount || '0')), 'Not enough balance');
            dispatch(addAction(CommonActions.WAITING, { source: 'stakeSignAndSend' }));
            const token = this.getToken(dispatch);
            let txs = (await this.api({
                command: 'stakeTokenSignAndSendGetTransaction', data: {token, amount, network, contractAddress, userAddress},
                params: []}as JsonRpcRequest)) as CustomTransactionCallRequest[];
            if (!txs || !txs.length) {
                dispatch(addAction(Actions.STAKING_FAILED, { message: 'Could not create a stake transaction.' }));
            }
            const connect = inject<UnifyreExtensionWeb3Client>(UnifyreExtensionWeb3Client);
            
            const res = await connect.getUserProfile()
            const requestId = await connect.sendTransactionAsync(network, txs,
                {amount, contractAddress, action: 'stake'})
            console.log(requestId,'resresres')
    
            if (!requestId) {
                dispatch(addAction(Actions.STAKING_FAILED, { message: 'Could not submit transaction.' }));
            }
            await this.processRequest(dispatch, requestId);
            return 'success';
        } catch (e) {
            logError('Error signAndSend', e);
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
            let txs = (await this.api({
                command: 'unstakeTokenSignAndSendGetTransaction', data: {
                    amount, network, contractAddress, userAddress},
                params: []}as JsonRpcRequest)) as CustomTransactionCallRequest[];
            if (!txs || !txs.length) {
                dispatch(addAction(Actions.UN_STAKING_FAILED, { message: 'Could not create an un-stake transaction.' }));
            }
            const requestId = await this.client.sendTransactionAsync(network, txs,
                {amount, contractAddress, action: 'unstake'});
            if (!requestId) {
                dispatch(addAction(Actions.UN_STAKING_FAILED, { message: 'Could not submit transaction.' }));
            }
            await this.processRequest(dispatch, requestId);
            return 'success';
        } catch (e) {
            logError('Error unstakeSsignAndSend', e);
            dispatch(addAction(Actions.UN_STAKING_FAILED, { message: 'Could not send a sign request. ' + e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'unstakeSignAndSend' }));
        }
    }

    async takeRewardsSignAndSend(
        dispatch: Dispatch<AnyAction>, 
        network: Network,
        contractAddress: string,
        userAddress: string,
        ): Promise<string|undefined> {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'takeRewardsSignAndSend' }));
            let txs = (await this.api({
                command: 'takeRewardsSignAndSendGetTransaction', data: {
                    network, contractAddress, userAddress},
                params: []}as JsonRpcRequest)) as CustomTransactionCallRequest[];
            if (!txs || !txs.length) {
                dispatch(addAction(Actions.UN_STAKING_FAILED, { message: 'Could not create an un-stake transaction.' }));
            }
            const requestId = await this.client.sendTransactionAsync(network, txs,
                {amount: '0', contractAddress, action: 'unstake'});
            if (!requestId) {
                dispatch(addAction(Actions.UN_STAKING_FAILED, { message: 'Could not submit transaction.' }));
            }
            await this.processRequest(dispatch, requestId);
            return 'success';
        } catch (e) {
            logError('Error takeRewardsSsignAndSend', e);
            dispatch(addAction(Actions.UN_STAKING_FAILED, { message: 'Could not send a sign request. ' + e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'takeRewardsSignAndSend' }));
        }
    }

    async loadGroupInfo(dispatch: Dispatch<AnyAction>, groupId: string): Promise<GroupInfo|undefined> {
        try {
            ValidationUtils.isTrue(!!groupId, '"groupId" must be provided');
            dispatch(addAction(CommonActions.WAITING, { source: 'loadGroupInfo' }));
            let groupInfo = (await this.api({
                command: 'getGroupInfo', data: {groupId},
                params: []}as JsonRpcRequest)) as GroupInfo;
            if (!groupInfo) {
                return undefined;
            }
            dispatch(addAction(Actions.GROUP_INFO_LOADED, groupInfo));
            return groupInfo;
        } catch (e) {
            logError('Error loading group info', e);
            return;
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'loadGroupInfo' }));
        }
    }

    async loadHttpProviders(dispatch: Dispatch<AnyAction>): Promise<any> {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'loadHttpProviders' }));
            let providers = (await this.api({
                command: 'getHttpProviders', data: {},
                params: []}as JsonRpcRequest)) as any;
            if (!providers) {
                throw new Error('getHttpProviders returned empty');
            }
            return providers;
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'loadHttpProviders' }));
        }
    }

    protected getToken(dispatch: Dispatch<AnyAction>) {
        return '';
    }
}