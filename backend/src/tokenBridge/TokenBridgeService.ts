import { MongooseConnection } from "aws-lambda-helper";
import { EthereumSmartContractHelper } from "aws-lambda-helper/dist/blockchain";
import { ChainUtils } from "ferrum-chain-clients";
import { Injectable, Network, ValidationUtils } from "ferrum-plumbing";
import { Connection, Document, Model} from "mongoose";
import { PairAddressSignatureVerifyre } from "./common/PairAddressSignatureVerifyer";
import { TokenBridgeContractClinet } from "./TokenBridgeContractClient";
import { RequestMayNeedApprove, SignedPairAddress, SignedPairAddressSchemaModel, UserBridgeWithdrawableBalanceItem, UserBridgeWithdrawableBalanceItemModel } from "./TokenBridgeTypes";
import { Big } from 'big.js';

export class TokenBridgeService extends MongooseConnection implements Injectable {
    private signedPairAddressModel?: Model<SignedPairAddress&Document>;
    private balanceItem?: Model<UserBridgeWithdrawableBalanceItem&Document>;
    private con: Connection|undefined;
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
        this.con = con;
    }

    __name__() { return 'TokenBridgeService'; }

    async withdrawSignedGetTransaction(receiveTransactionId: string, userAddress: string) {
        const w = await this.getWithdrawItem(receiveTransactionId);
        ValidationUtils.isTrue(!!w, `Withdraw item with receiveTransactionId ${receiveTransactionId} was not found`)
        ValidationUtils.isTrue(ChainUtils.addressesAreEqual(
            w.sendNetwork as Network, userAddress, w.sendAddress),
            "Provided address is not the receiver of withdraw");
        return this.contract.withdrawSigned(w, userAddress);
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

    async swapGetTransaction(userAddress: string, currency: string, amount: string, targetCurrency: string) {
        const requests = await this.contract.approveIfRequired(userAddress, currency, amount);
        if (requests.length) {
            return {isApprove: true, requests};
        }
        const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
        const userBalance = await this.helper.erc20(network, token).methods.balanceOf(userAddress).call();
        const balance = await this.helper.amountToHuman(currency, userBalance);
        ValidationUtils.isTrue(new Big(balance).gte(new Big(amount)),
            `Not enough balance. ${amount} is required but there is only ${balance} available`);
        const req = await this.contract.swap(userAddress, currency, amount,  targetCurrency);
        return { isApprove: false, requests: [req] };
    }

    async withdrawSignedVerify(targetCurrency: string, payee: string, amount: string,
        hash: string, salt: string, signature: string, expectedAddress: string) {
        console.log('About to call withdrawSignedVerify')
        return await this.contract.withdrawSignedVerify(targetCurrency,
            payee, amount, hash, salt, signature, expectedAddress);
    }

    async getWithdrawItemByReceiveTransaction(receiveTransactionId: string): Promise<UserBridgeWithdrawableBalanceItem> {
        this.verifyInit();
        const rv = await this.balanceItem!.findOne({receiveTransactionId});
        //@ts-ignore
        return rv ? rv.toJSON(): rv;
    }

    async getWithdrawItem(receiveTransactionId: string): Promise<UserBridgeWithdrawableBalanceItem> {
        this.verifyInit();
        const rv = await this.balanceItem!.findOne({receiveTransactionId});
        //@ts-ignore
        return rv ? rv.toJSON(): rv;
    }

    async newWithdrawItem(item: UserBridgeWithdrawableBalanceItem): Promise<void> {
        this.verifyInit();
        await new this.balanceItem!(item).save();
    }

    async getLiquidity(address: string, currency: string) {
        return { liquidity: await this.contract.getLiquidity(address, currency) };
    }

    async getTokenAllowance(address: string, currency: string) {
        return { liquidity: await this.contract.getTokenAllowance(address, currency) };
    }

    async getAvailableLiquidity(address: string) {
        return { liquidity: await this.contract.getAvaialableLiquidity(address) };
    }

    async getUserWithdrawItems(network: string, address: string): Promise<UserBridgeWithdrawableBalanceItem[]> {
        this.verifyInit();
        const items = (
            await this.balanceItem!.find(
                {
                    '$or': [
                        {
                            'sendAddress': ChainUtils.canonicalAddress(network as any, address)
                        },
                        {
                            'receiveAddress': ChainUtils.canonicalAddress(network as any, address)
                        }
                    ]
                })
            );
        console.log({receiveNetwork: network, address: ChainUtils.canonicalAddress(network as any, address)})
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
            const txStatus = await this.helper.getTransactionStatus(item!.sendNetwork, tid, txItem.timestamp);
            txItem.status = txStatus;
            console.log(`Updating status for withdraw item ${id}: ${txStatus}-${tid}`);
            if(txStatus === ('timedout' || 'failed')){
                item.used = 'failed';
            }else if(txStatus === 'successful'){
                item.used = 'completed'
            }else{
                item.used = 'pending'
            }
        } else {
            const txTime = Date.now();
            const txStatus = await this.helper.getTransactionStatus(item!.sendNetwork, tid, txTime);
            item.useTransactions = item.useTransactions || [];
            item.useTransactions.push({id: tid, status: txStatus, timestamp: txTime});
            if(txStatus === ('timedout' || 'failed')){
                item.used = 'failed';
            }else if(txStatus === 'successful'){
                item.used = 'completed'
            }else{
                item.used = 'pending'
            }
        }
        return await this.updateWithdrawItem(item);
    }

    async getSwapTransactionStatus(tid: string,sendNetwork: string,timestamp:number) {
        ValidationUtils.isTrue(!!tid, "tid not found.");
        ValidationUtils.isTrue(!!sendNetwork, "sendNetwork not found.");
        ValidationUtils.isTrue(!!timestamp, "timestamp not found.");
        const txStatus = await this.helper.getTransactionStatus(sendNetwork, tid, timestamp);
        if(!!txStatus){
            return txStatus
        }           
    }

    async getUserPairedAddress(network: string, address: string): Promise<SignedPairAddress|undefined> {
        this.verifyInit();
        ValidationUtils.isTrue(!!address, '"address" must be provided');
        address = ChainUtils.canonicalAddress(network as Network, address.toLocaleLowerCase());
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
        //@ts-ignore
        return !!rv ? rv.toJSON() : rv;
    }

    async unpairUserPairedAddress(pair: SignedPairAddress) {
        this.verifyInit();
        ValidationUtils.isTrue(!!pair.pair, 'Invalid pair (empty)');
        ValidationUtils.isTrue(!!pair.pair.address1, 'address 1 is required');
        const res = await this.signedPairAddressModel!.remove({'pair.address1': pair.pair.address1});
        ValidationUtils.isTrue(!!res, 'Could not update the balance item');
        return res

    }
    
    async updateUserPairedAddress(pair: SignedPairAddress) {
        this.verifyInit();
        ValidationUtils.isTrue(!!pair.pair, 'Invalid pair (empty)');
        ValidationUtils.isTrue(!!pair.pair.address1 && !!pair.pair.address2, 'Both addresses are required');
        ValidationUtils.isTrue(!!pair.pair.network1 && !!pair.pair.network2, 'Both networks are required');
        ValidationUtils.isTrue(!!pair.signature1 || !!pair.signature2, 'At least one signature is required');
        pair.pair.address1 = ChainUtils.canonicalAddress(pair.pair.network1 as Network, pair.pair.address1);
        pair.pair.address2 = ChainUtils.canonicalAddress(pair.pair.network2 as Network, pair.pair.address2);
        if (pair.signature1) {
            //Verify signature
            ValidationUtils.isTrue(!!this.verifyer.verify1(pair), 'Invalid signature 1');
        }
        if (pair.signature2) {
            //Verify signature
            ValidationUtils.isTrue(!!this.verifyer.verify2(pair), 'Invalid signature 2');
        }
        const res = await this.signedPairAddressModel!.updateOne(
            {'pair.address1': pair.pair.address1}, {'$set': {...pair}}, {upsert: true});
        ValidationUtils.isTrue(!!res, 'Could not update the item');
        return res

    }

    async close() {
        if (this.con) {
            await this.con!.close();
        }
    }
}
