import { JsonRpcRequest, Network, ValidationUtils } from "ferrum-plumbing";
import { AnyAction, Dispatch } from "redux";
import { CustomTransactionCallRequest } from "unifyre-extension-sdk";
import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { addAction, CommonActions } from "../common/Actions";
import { StakeEvent } from "../common/Types";
import { StakingAppClient, StakingAppServiceActions } from "./StakingAppClient";
import { Big } from 'big.js';
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
            console.error('Error signAndSend', e);
            dispatch(addAction(Actions.STAKING_FAILED, { message: 'Could send a sign request. ' + e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'signAndSend' }));
        }
    }

    protected getToken(dispatch: Dispatch<AnyAction>) {
        return '';
    }
}