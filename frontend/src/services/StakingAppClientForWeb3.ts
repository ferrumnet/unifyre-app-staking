import { JsonRpcRequest, Network, ValidationUtils } from "ferrum-plumbing";
import { AnyAction, Dispatch } from "redux";
import { CustomTransactionCallRequest } from "unifyre-extension-sdk";
import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { addAction, CommonActions } from "../common/Actions";
import { StakingAppClient, StakingAppServiceActions } from "./StakingAppClient";
import { Big } from 'big.js';
import { logError } from "../common/Utils";
import { GroupInfo } from "../common/Types";
const Actions = StakingAppServiceActions;

export class StakingAppClientForWeb3 extends StakingAppClient {
    async signInToServer(dispatch: Dispatch<AnyAction>): Promise<AppUserProfile|undefined> {
        dispatch(addAction(CommonActions.WAITING, { source: 'signInToServer' }));
        try {
            await this.client.signInWithToken('');
            const userProfile = await this.client.getUserProfile();
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
            ValidationUtils.isTrue(new Big(amount).gt(new Big('0')), 'Amount must be positive');
            ValidationUtils.isTrue(new Big(balance).gte(new Big(amount)), 'Not enough balance');
            dispatch(addAction(CommonActions.WAITING, { source: 'stakeSignAndSend' }));
            const token = this.getToken(dispatch);
            let txs = (await this.api({
                command: 'stakeTokenSignAndSendGetTransaction', data: {token, amount, network, contractAddress, userAddress},
                params: []}as JsonRpcRequest)) as CustomTransactionCallRequest[];
            if (!txs || !txs.length) {
                dispatch(addAction(Actions.STAKING_FAILED, { message: 'Could not create a stake transaction.' }));
            }
            const requestId = await this.client.sendTransactionAsync(network, txs,
                {amount, contractAddress, action: 'stake'});
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

    protected getToken(dispatch: Dispatch<AnyAction>) {
        return '';
    }
}