import { JsonRpcRequest, Network, ValidationUtils } from "ferrum-plumbing";
import { AnyAction, Dispatch } from "redux";
import { CustomTransactionCallRequest } from "unifyre-extension-sdk";
import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { addAction, CommonActions } from "../common/Actions";
import { StakeEvent } from "../common/Types";
import { StakingAppClient, StakingAppServiceActions } from "./StakingAppClient";
const Actions = StakingAppServiceActions;

export class StakingAppClientForWeb3 extends StakingAppClient {
    async signInToServer(dispatch: Dispatch<AnyAction>): Promise<AppUserProfile|undefined> {
        dispatch(addAction(CommonActions.WAITING, { source: 'signInToServer' }));
        try {
            await this.client.signInWithToken('');
            const userProfile = this.client.getUserProfile();
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
            if (!token) { return; }
            let txs = (await this.api({
                command: 'stakeTokenSignAndSendGetTransaction', data: {token, amount, network, contractAddress, userAddress},
                params: []}as JsonRpcRequest)) as CustomTransactionCallRequest[];
            if (!txs || !txs.length) {
                dispatch(addAction(Actions.STAKING_FAILED, { message: 'Could not create a stake transaction.' }));
            }
            const requestId = await this.client.sendTransactionAsync(network, txs);
            if (!requestId) {
                dispatch(addAction(Actions.STAKING_FAILED, { message: 'Could not submit transaction.' }));
            }

            const response = await this.client.getSendTransactionResponse(requestId);
            if (response.rejected) {
                throw new Error((response as any).reason || 'Request was rejected');
            }
            const txIds = (response.response || []).map(r => r.transactionId);  
            const res = await this.api({
                command: 'stakeEventProcessTransactions', data: {token, amount, eventType: 'stake',
                    contractAddress, txIds},
                params: []}as JsonRpcRequest) as {stakeEvent?: StakeEvent};
            const stakeEvent = res.stakeEvent;

            ValidationUtils.isTrue(!!stakeEvent, 'Error while getting the stake transaction! Your stake might have been executed. Please check etherscan for a pending stake transation');
            dispatch(addAction(Actions.USER_STAKE_EVENTS_UPDATED, { updatedEvents: [stakeEvent] }));
            return stakeEvent!.mainTxId;
        } catch (e) {
            console.error('Error signAndSend', e);
            dispatch(addAction(Actions.STAKING_FAILED, { message: 'Could send a sign request. ' + e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'signAndSend' }));
        }
    }
}