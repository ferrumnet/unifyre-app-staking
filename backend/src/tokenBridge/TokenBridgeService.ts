import { MongooseConnection } from "aws-lambda-helper";
import { EthereumSmartContractHelper } from "aws-lambda-helper/dist/blockchain";
import { Injectable, ValidationUtils } from "ferrum-plumbing";
import { Connection, Document, Model } from "mongoose";
import { PairAddressSignatureVerifyre } from "./common/PairAddressSignatureVerifyer";
import { TokenBridgeContractClinet } from "./TokenBridgeContractClient";
import { RequestMayNeedApprove, SignedPairAddress, SignedPairAddressSchemaModel, UserBridgeWithdrawableBalanceItem, UserBridgeWithdrawableBalanceItemModel } from "./TokenBridgeTypes";

export class TokenBridgeService extends MongooseConnection implements Injectable {
    private signedPairAddressModel?: Model<SignedPairAddress&Document>;
    private balanceItem?: Model<UserBridgeWithdrawableBalanceItem&Document>;
    constructor(
        private helper: EthereumSmartContractHelper,
        private contract: TokenBridgeContractClinet,
        private verifyer: PairAddressSignatureVerifyre,
    ) {
        super();
    }

    initModels(con: Connection): void {
        this.signedPairAddressModel = SignedPairAddressSchemaModel(con);
        this.balanceItem = UserBridgeWithdrawableBalanceItemModel(con);
    }

    __name__() { return 'TokenBridgeService'; }

    async withdrawSignedGetTransaction(id: string, userAddress: string) {
        const w = await this. getWithdrawItem(id);
        ValidationUtils.isTrue(userAddress === w.receiveAddress,
            "Provided address is not the receiver of withdraw");
        return this.contract.withdrawSigned(w.receiveCurrency, w.receiveAddress,
            w.receiveAmount, w.salt, w.signedWithdrawSignature);
    }

    async addLiquidityGetTransaction(userAddress: string, currency: string, amount: string):
        Promise<RequestMayNeedApprove> {
        const requests = await this.contract.approveIfRequired(userAddress, currency, amount);
        if (requests.length) {
            return {isApprove: true, requests};
        }
        const req = await this.contract.addLiquidity(userAddress, currency, amount);
        return { isApprove: false, requests: [req] };
    }

    async removeLiquidityIfPossibleGetTransaction(userAddress: string, currency: string, amount: string) {
        return await this.contract.removeLiquidityIfPossible(userAddress, currency, amount);
    }

    async getWithdrawItem(id: string): Promise<UserBridgeWithdrawableBalanceItem> {
        this.verifyInit();
        const rv = await this.balanceItem!.findOne({id});
        return rv ? rv.toJSON(): rv;
    }

    async getLiquidity(address: string, currency: string) {
        return { liquidity: await this.contract.getLiquidity(address, currency) };
    }

    async getUserWithdrawItems(network: string, address: string): Promise<UserBridgeWithdrawableBalanceItem[]> {
        this.verifyInit();
        const items = (await this.balanceItem!.find({
            receiveNetwork: network, receiveAddress: address,
        })) || [];
        return items.map(i => i.toJSON());
    }

    private async updateWithdrawItem(item: UserBridgeWithdrawableBalanceItem) {
        this.verifyInit();
        const res = await this.balanceItem!.findOneAndUpdate({id: item.id}, { '$set': { ...item } });
        ValidationUtils.isTrue(!!res, 'Could not update the balance item');
        return item;
    }

    async updateWithdrawItemAddTransaction(id: string, tid: string) {
        let item = await this.getWithdrawItem(id);
        item = {...item};
        ValidationUtils.isTrue(!!item, "Withdraw item with the provided id not found.");
        const txItem = (item.useTransactions || []).find(t => t.id === tid);
        if (!!txItem) {
            const txStatus = await this.helper.getTransactionStatus(item!.receiveNetwork, tid, txItem.timestamp);
            txItem.status = txStatus;
        } else {
            const txTime = Date.now();
            const txStatus = await this.helper.getTransactionStatus(item!.receiveNetwork, tid, txTime);
            item.useTransactions.push({id: tid, status: txStatus, timestamp: txTime});
        }
        await this.updateWithdrawItem(item);
    }

    async getUserPairedAddress(network: string, address: string) {
        this.verifyInit();
        const rv = await this.signedPairAddressModel!.findOne(
            {'$or': [
                {
                    '$and': [{ 'pair.address1': address }, { 'pair.network1': network } ],
                },
                {
                    '$and': [{ 'pair.address2': address }, { 'pair.network2': network } ],
                },
            ]}
        )
        return !!rv ? rv.toJSON() : rv;
    }
    
    async updateUserPairedAddress(pair: SignedPairAddress) {
        this.verifyInit();
        ValidationUtils.isTrue(!!pair.pair, 'Invalid pair (empty)');
        ValidationUtils.isTrue(!!pair.pair.address1 && !!pair.pair.address2, 'Both addresses are required');
        ValidationUtils.isTrue(!!pair.pair.network1 && !!pair.pair.network2, 'Both networks are required');
        ValidationUtils.isTrue(!!pair.signature1 || !!pair.signature2, 'At least one signature is required');
        if (pair.signature1) {
            //Verify signature
            ValidationUtils.isTrue(!!this.verifyer.verify1(pair), 'Invalid signature 1');
        }
        if (pair.signature2) {
            //Verify signature
            ValidationUtils.isTrue(!!this.verifyer.verify2(pair), 'Invalid signature 2');
        }
        await this.signedPairAddressModel!.update(
            {'pair.address1': pair.pair.address1}, pair, {upsert: true});
    }
}