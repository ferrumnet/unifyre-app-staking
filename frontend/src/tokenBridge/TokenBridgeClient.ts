import { Injectable, JsonRpcRequest, Network, ValidationUtils } from "ferrum-plumbing";
import { AnyAction, Dispatch } from "redux";
import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { addAction, CommonActions } from "../common/Actions";
import { GroupInfo } from "../common/Types";
import { logError } from "../common/Utils";
import { ApiClient } from "./ApiClient";
import { SignedPairAddress, UserBridgeWithdrawableBalanceItem } from "./TokenBridgeTypes";

export const TokenBridgeActions = {
    AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
    BRIDGE_BALANCE_LOADED: 'BRIDGE_BALANCE_LOADED',
    BRIDGE_ADDING_TRANSACTION_FAILED: 'BRIDGE_ADDING_TRANSACTION_FAILED',
    BRIDGE_BALANCE_ITEM_UPDATED: 'BRIDGE_BALANCE_ITEM_UPDATED',
    BRIDGE_LIQUIDITY_FOR_USER_LOADED: 'BRIDGE_LIQUIDITY_FOR_USER_LOADED',
    BRIDGE_LIQUIDITY_PAIRED_ADDRESS_RECEIVED: 'BRIDGE_LIQUIDITY_PAIRED_ADDRESS_RECEIVED',
    BRIDGE_REMOVE_LIQUIDITY_FAILED: 'BRIDGE_REMOVE_LIQUIDITY_FAILED',
    BRIDGE_SWAP_FAILED: 'BRIDGE_SWAP_FAILED',
    BRIDGE_ADD_LIQUIDITY_FAILED: 'BRIDGE_ADD_LIQUIDITY_FAILED',
    BRIDGE_AVAILABLE_LIQUIDITY_FOR_TOKEN: 'BRIDGE_AVAILABLE_LIQUIDITY_FOR_TOKEN',
    BRIDGE_LOAD_FAILED: 'BRIDGE_LOAD_FAILED',
    SOURCE_CURRENCIES_RECEIVED: 'SOURCE_CURRENCIES_RECEIVED',
    USER_AVAILABLE_LIQUIDITY_FOR_TOKEN: "USER_AVAILABLE_LIQUIDITY_FOR_TOKEN",
    SWAP_SUCCESS: 'SWAP_SUCCESS',
    GROUP_INFO_LOADED: 'GROUP_INFO_LOADED'
}

const Actions = TokenBridgeActions;

export class TokenBridgeClient extends ApiClient implements Injectable {
    private network?: Network;
    private userAddress?: string;

    public getUserAddress() {return this. userAddress;} // DO NOT USE

    __name__() { return 'TokenBridgeClient'; }

    async signInToServer(dispatch: Dispatch<AnyAction>): Promise<AppUserProfile|undefined> {
        dispatch(addAction(CommonActions.WAITING, { source: 'signInToServer' }));
        try {
            const userProfile = await this.client.getUserProfile();
            const userAddress = userProfile.userId;
            console.log(userProfile,'userprofileletre')
            this.network = userProfile.accountGroups[0].addresses[0]?.network;
            this.userAddress = userProfile.accountGroups[0].addresses[0]?.address;
            const res = await this.api({
                command: 'signInUsingAddress', data: {userAddress}, params: [] } as JsonRpcRequest);
            const { unsecureSession } = res;
            if (!unsecureSession) {
                dispatch(addAction(Actions.AUTHENTICATION_FAILED, { message: 'Could not connect to backend' }));
                return;
            }
            this.jwtToken = unsecureSession;
            await this.loadDataAfterSignIn(dispatch);
            return userProfile;
        } catch (e) {
            console.error('signInToServer', e)
            dispatch(addAction(Actions.AUTHENTICATION_FAILED, {
                message: 'Could not connect to network ' + e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'signInToServer' }));
        }
    }

    protected async loadDataAfterSignIn(dispatch: Dispatch<AnyAction>) {
        await this.loadUserPairedAddress(dispatch,);
        await this.loadUserBridgeBalance(dispatch);
        // await this.loadUserBridgeLiquidity(dispatch, this.userAddress!);
    }

    private async loadUserPairedAddress(dispatch: Dispatch<AnyAction>) {
        const res = await this.api({
            command: 'getUserPairedAddress', data: {network: this.network}, params: [] } as JsonRpcRequest);
        const { pairedAddress } = res;
        dispatch(addAction(Actions.BRIDGE_LIQUIDITY_PAIRED_ADDRESS_RECEIVED, {pairedAddress: pairedAddress || {}}))
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

    async getSourceCurrencies(dispatch: Dispatch<AnyAction>,network: string) {
        const res = await this.api({
            command: 'getSourceCurrencies', data: {network}, params: [] } as JsonRpcRequest);
        return res;
    }

    async checkTxStatus(dispatch: Dispatch<AnyAction>,txId: string,sendNetwork: string,timestamp: number) {
        try {
        const res = await this.api({
            command: 'GetSwapTransactionStatus', data: {tid: txId,sendNetwork,timestamp}, params: [] } as JsonRpcRequest);
        return res;
        } catch(e) {
            dispatch(addAction(Actions.BRIDGE_LOAD_FAILED, {
                message: e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'getAvailableLiquidity' }));
        }
    }

    public async getAvailableLiquidity(dispatch: Dispatch<AnyAction>,
            targetNetwork: string,
            targetCurrency: string) {
        dispatch(addAction(CommonActions.WAITING, { source: 'getAvailableLiquidity' }));
        try {
            // Get the available liquidity for target network
            const res = await this.api({
                command: 'getAvaialableLiquidity', data: {userAddress: targetNetwork, currency: targetCurrency}, params: [] } as JsonRpcRequest);
            if(res){
                const { liquidity } = res;
                dispatch(addAction(Actions.BRIDGE_AVAILABLE_LIQUIDITY_FOR_TOKEN, {liquidity}))
            }

            //ValidationUtils.isTrue(!liquidity, 'Invalid liquidity received');
            //dispatch(addAction(Actions.BRIDGE_AVAILABLE_LIQUIDITY_FOR_TOKEN, {liquidity}))
        } catch(e) {
            dispatch(addAction(Actions.BRIDGE_LOAD_FAILED, {
                message: e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'getAvailableLiquidity' }));
        }
    }

    
    public async getUserLiquidity(dispatch: Dispatch<AnyAction>,
        userAddr: string,
        targetCurrency: string) {
        dispatch(addAction(CommonActions.WAITING, { source: 'getAvailableLiquidity' }));
        try {
            // Get the available liquidity for target network
            const res = await this.api({
                command: 'getLiquidity', data: {userAddress: userAddr, currency: targetCurrency || ''}, params: [] } as JsonRpcRequest);
            if(res){
                const { liquidity } = res;
                dispatch(addAction(Actions.USER_AVAILABLE_LIQUIDITY_FOR_TOKEN, {liquidity}))
            }

            //ValidationUtils.isTrue(!liquidity, 'Invalid liquidity received');
            //dispatch(addAction(Actions.BRIDGE_AVAILABLE_LIQUIDITY_FOR_TOKEN, {liquidity}))
        } catch(e) {
            dispatch(addAction(Actions.AUTHENTICATION_FAILED, {
                message: e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'getAvailableLiquidity' }));
        }
    }

    /**
     * Loads withdrawable balances for user. User can withdraw them one by one.
     */
    public async loadUserBridgeLiquidity(dispatch: Dispatch<AnyAction>,
            currency: string) {
        dispatch(addAction(CommonActions.WAITING, { source: 'loadUserBridgeLiquidity' }));
        try {
            // Get the liquidity from web3...
            const res = await this.api({
                command: 'getLiquidity', data: {userAddress: this.userAddress!, currency}, params: [] } as JsonRpcRequest);
            const { liquidity } = res;
            ValidationUtils.isTrue(!liquidity, 'Invalid liquidity received');
            dispatch(addAction(Actions.BRIDGE_LIQUIDITY_FOR_USER_LOADED, {liquidity}))
        } catch(e) {
            dispatch(addAction(Actions.BRIDGE_ADDING_TRANSACTION_FAILED, {
                message: e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'withdrawableBalanceItemAddTransaction' }));
        }
    }

    /**
     * Loads liquidity added by user
     */
    async loadUserBridgeBalance(dispatch: Dispatch<AnyAction>): Promise<UserBridgeWithdrawableBalanceItem[]> {
        const res = await this.api({
            command: 'getUserWithdrawItems', data: {network: this.network, userAddress: this.userAddress}, params: [] } as JsonRpcRequest);
        const { withdrawableBalanceItems } = res;
        ValidationUtils.isTrue(!!withdrawableBalanceItems, 'Invalid balances received');
        dispatch(addAction(Actions.BRIDGE_BALANCE_LOADED, {withdrawableBalanceItems}))
        console.log('GOT ITEMS', {withdrawableBalanceItems})
        return withdrawableBalanceItems || [];
    }

    public async withdraw(
        dispatch: Dispatch<AnyAction>,
        w: UserBridgeWithdrawableBalanceItem,
        ) {
        dispatch(addAction(CommonActions.WAITING, { source: 'withdraw' }));
        try {
            ValidationUtils.isTrue(this.network === w.sendNetwork, 
                `Connected to ${this.network} but the balance item can be claimed on ${w.sendNetwork}`);
            const res = await this.api({
                command: 'withdrawSignedGetTransaction', data: {id: w.receiveTransactionId}, params: [] } as JsonRpcRequest);
            ValidationUtils.isTrue(!!res, 'Error calling withdraw. No requests');
            const requestId = await this.client.sendTransactionAsync(this.network!, [res],
                {});
            ValidationUtils.isTrue(!!requestId, 'Could not submit transaction.');
            const response = await this.client.getSendTransactionResponse(requestId);
            if (response.rejected) {
                throw new Error((response as any).reason || 'Request was rejected');
            }
            const txIds = (response.response || []).map(r => r.transactionId);
            dispatch(addAction(CommonActions.WAITING, { source: 'withdrawableBalanceItemAddTransaction' }));
            await this.withdrawableBalanceItemUpdateTransaction(dispatch, w.receiveTransactionId, txIds[0]);
            return 'success';
        } catch(e) {
            dispatch(addAction(Actions.AUTHENTICATION_FAILED, {
                message: e.message || '' }));
            dispatch(addAction(Actions.BRIDGE_SWAP_FAILED, {
                message: e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'withdrawableBalanceItemAddTransaction' }));
        }
    }


    public async withdrawableBalanceItemUpdateTransaction(dispatch: Dispatch<AnyAction>,
        id: string,
        transactionId: string) {
        try {
            const res = await this.api({
                command: 'updateWithdrawItemAddTransaction',
                data: {id, transactionId}, params: [] } as JsonRpcRequest);
            const { withdrawableBalanceItem } = res;
            ValidationUtils.isTrue(!withdrawableBalanceItem, 'Error updating balance item');
            dispatch(addAction(Actions.BRIDGE_BALANCE_ITEM_UPDATED, {withdrawableBalanceItem}))
        } catch(e) {
            dispatch(addAction(Actions.BRIDGE_ADDING_TRANSACTION_FAILED, {
                message: e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'withdrawableBalanceItemAddTransaction' }));
        }
    }

    /**
     * Loads liquidity added by user
     */
     async updateUserPairedAddress(dispatch: Dispatch<AnyAction>, pair: SignedPairAddress) {
        const res = await this.api({
            command: 'updateUserPairedAddress', data: {pair}, params: [] } as JsonRpcRequest);
        return res;
    }

    /**
     * Loads liquidity added by user
     */
     async unpairUserPairedAddress(dispatch: Dispatch<AnyAction>, pair: SignedPairAddress) {
        const res = await this.api({
            command: 'unpairUserPairedAddress', data: {pair}, params: [] } as JsonRpcRequest);
        return res;
    }

    async getUserWithdrawItems(dispatch: Dispatch<AnyAction>, network: string) {
        try {
            const res = await this.api({command: 'getUserWithdrawItems', data: { network }, params: [] } as JsonRpcRequest);
            return res;
        } catch(e) {
            dispatch(addAction(Actions.BRIDGE_ADDING_TRANSACTION_FAILED, {
                message: e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'withdrawableBalanceItemAddTransaction' }));
        }
    }

    public async addLiquidity(
        dispatch: Dispatch<AnyAction>,
        currency: string,
        amount: string,
        ) {
        dispatch(addAction(CommonActions.WAITING, { source: 'signInToServer' }));
        try {
            const res = await this.api({
                command: 'addLiquidityGetTransaction',
                data: {currency, amount}, params: [] } as JsonRpcRequest);
            const { isApprove, requests } = res;
            ValidationUtils.isTrue(!!requests && !!requests.length, 'Error calling add liquidity. No requests');
            console.log('About to submit request', {requests});
            const requestId = await this.client.sendTransactionAsync(this.network!, requests,
                {currency, amount, action: isApprove ? 'approve' : 'addLiquidity'});
            ValidationUtils.isTrue(!!requestId, 'Could not submit transaction.');
            await this.processRequest(dispatch, requestId);
            return {
                "status":'success',
                "txId": requestId.split('|')[0],
            };
        } catch(e) {
            dispatch(addAction(Actions.BRIDGE_ADD_LIQUIDITY_FAILED, {
                message: e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'withdrawableBalanceItemAddTransaction' }));
        }
    }

    public async removeLiquidity(
        dispatch: Dispatch<AnyAction>,
        currency: string,
        amount: string,
        ) {
        dispatch(addAction(CommonActions.WAITING, { source: 'signInToServer' }));
        try {
            const res = await this.api({
                command: 'removeLiquidityIfPossibleGetTransaction',
                data: {currency, amount}, params: [] } as JsonRpcRequest);
            ValidationUtils.isTrue(!!res, 'Error calling remove liquidity. No requests');
            const requestId = await this.client.sendTransactionAsync(this.network!, [res],
                {currency, amount, action: 'removeLiquidity'});
            ValidationUtils.isTrue(!!requestId, 'Could not submit transaction.');
            await this.processRequest(dispatch, requestId);
            return {
                "status":'success',
                "txId": requestId.split('|')[0],
            };
        } catch(e) {
            dispatch(addAction(Actions.BRIDGE_REMOVE_LIQUIDITY_FAILED, {
                message: e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'removeLiquidity' }));
        }
    }

    public async swap(
        dispatch: Dispatch<AnyAction>,
        currency: string,
        amount: string,
        targetCurrency: string,
        ) {
        dispatch(addAction(CommonActions.WAITING, { source: 'signInToServer' }));
        try {
            const res = await this.api({
                command: 'swapGetTransaction',
                data: {currency, amount, targetCurrency}, params: [] } as JsonRpcRequest);
            const { isApprove, requests } = res;
            ValidationUtils.isTrue(!!requests && !!requests.length, 'Error calling swap. No requests');
            const requestId = await this.client.sendTransactionAsync(this.network!, requests,
                {currency, amount, targetCurrency, action: isApprove ? 'approve' : 'swap'});
            ValidationUtils.isTrue(!!requestId, 'Could not submit transaction.');
            const response = await this.processRequest(dispatch, requestId);            
            return {
                "status":'success',
                "txId": requestId.split('|')[0],
                "itemId": response
            };
        } catch(e) {
            dispatch(addAction(Actions.BRIDGE_SWAP_FAILED, {
                message: e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'withdrawableBalanceItemAddTransaction' }));
        }
    }

    public async checkAllowance(
        dispatch: Dispatch<AnyAction>,
        currency: string,
        amount: string,
        targetCurrency: string,
        ) {
        dispatch(addAction(CommonActions.WAITING, { source: 'signInToServer' }));
        try {
            const res = await this.api({
                command: 'swapGetTransaction',
                data: {currency, amount, targetCurrency}, params: [] } as JsonRpcRequest);
            const { isApprove, requests } = res;
            return isApprove;
        } catch(e) {
            dispatch(addAction(Actions.BRIDGE_SWAP_FAILED, {
                message: e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'withdrawableBalanceItemAddTransaction' }));
        }
    }

    async processRequest(dispatch: Dispatch<AnyAction>, 
        requestId: string) {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'processRequest' }));
            const response = await this.client.getSendTransactionResponse(requestId);
            if (response.rejected) {
                throw new Error((response as any).reason || 'Request was rejected');
            }
            const txIds = (response.response || []).map(r => r.transactionId);
            const payload = response.requestPayload || {};
            const { action } = payload;
            // const res = await this.api({
            //     command: 'bridgeProcessTransaction', data: {amount, eventType: action, txIds},
            //     params: []}as JsonRpcRequest) as {stakeEvent?: StakeEvent};
            // ValidationUtils.isTrue(!!stakeEvent, 'Error while getting the transaction! Your stake might have been executed. Please check etherscan for a pending stake transation');
            // dispatch(addAction(Actions.USER_STAKE_EVENTS_UPDATED, { updatedEvents: [stakeEvent] }));
            dispatch(addAction(CommonActions.CONTINUATION_DATA_RECEIVED, {action,
                mainTxId: txIds[0]}));
            return txIds[0];
        } catch(e) {
            logError('Error processRequest', e);
            dispatch(addAction(CommonActions.CONTINUATION_DATA_FAILED, {message: 'Could send a request. ' + e.message || '' }));
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'processRequest' }));
        }
    }
}