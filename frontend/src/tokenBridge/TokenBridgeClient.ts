import { Injectable, JsonRpcRequest, ValidationUtils } from "ferrum-plumbing";
import { AnyAction, Dispatch } from "redux";
import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { addAction, CommonActions } from "../common/Actions";
import { ApiClient } from "./ApiClient";
import { SignedPairAddress } from "./TokenBridgeTypes";

export const TokenBridgeActions = {
    AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
    BRIDGE_BALANCE_LOADED: 'BRIDGE_BALANCE_LOADED',
    BRIDGE_ADDING_TRANSACTION_FAILED: 'BRIDGE_ADDING_TRANSACTION_FAILED',
    BRIDGE_BALANCE_ITEM_UPDATED: 'BRIDGE_BALANCE_ITEM_UPDATED',
    BRIDGE_LIQUIDITY_FOR_USER_LOADED: 'BRIDGE_LIQUIDITY_FOR_USER_LOADED',
    BRIDGE_LIQUIDITY_PAIRED_ADDRESS_RECEIVED: 'BRIDGE_LIQUIDITY_PAIRED_ADDRESS_RECEIVED',
}

const Actions = TokenBridgeActions;

export class TokenBridgeClient extends ApiClient implements Injectable {
    private network?: string;
    private userAddress?: string;
    private currency?: string;

    __name__() { return 'TokenBridgeClient'; }

    async signInToServer(dispatch: Dispatch<AnyAction>): Promise<AppUserProfile|undefined> {
        dispatch(addAction(CommonActions.WAITING, { source: 'signInToServer' }));
        try {
            const userProfile = await this.client.getUserProfile();
            const userAddress = userProfile.userId;
            this.network = userProfile.accountGroups[0].addresses[0].network;
            this.userAddress = userProfile.accountGroups[0].addresses[0].address;
            this.currency = userProfile.accountGroups[0].addresses[0].currency;
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
        //not implemented
        //await this.loadUserBridgeLiquidity(dispatch, this.userAddress!,this.currency!);
    }

    private async loadUserPairedAddress(dispatch: Dispatch<AnyAction>) {
        const res = await this.api({
            command: 'getUserPairedAddress', data: {network: this.network}, params: [] } as JsonRpcRequest);
        const { pairedAddress } = res;
        dispatch(addAction(Actions.BRIDGE_LIQUIDITY_PAIRED_ADDRESS_RECEIVED, {pairedAddress: pairedAddress || {}}))
    }

    /**
     * Loads withdrawable balances for user. User can withdraw them one by one.
     */
    public async loadUserBridgeLiquidity(dispatch: Dispatch<AnyAction>,
            userAddress: string, currency: string) {
        try {
            // Get the liquidity from web3...
            const res = await this.api({
                command: 'getLiquidity', data: {userAddress, currency}, params: [] } as JsonRpcRequest);
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
    private async loadUserBridgeBalance(dispatch: Dispatch<AnyAction>, userAddress: string) {
        const res = await this.api({
            command: 'loadUserBridgeBalance', data: {userAddress}, params: [] } as JsonRpcRequest);
        const { withdrawableBalanceItems } = res;
        ValidationUtils.isTrue(!withdrawableBalanceItems, 'Invalid balances received');
        dispatch(addAction(Actions.BRIDGE_BALANCE_LOADED, {withdrawableBalanceItems}))
    }

    public async withdrawableBalanceItemUpdateTransaction(dispatch: Dispatch<AnyAction>,
        id: string,
        transactionId: string) {
        dispatch(addAction(CommonActions.WAITING, { source: 'withdrawableBalanceItemAddTransaction' }));
        try {
            const res = await this.api({
                command: 'withdrawableBalanceItemAddTransaction',
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
}