import { EthereumSmartContractHelper } from "aws-lambda-helper/dist/blockchain";
import { Injectable, JsonRpcRequest, ValidationUtils } from "ferrum-plumbing";
import { TokenBridgeService } from "./TokenBridgeService";
import { BridgeConfigStorage } from './processor/BridgeConfigStorage';
export class TokenBridgeHttpHandler implements Injectable {
    constructor(
        private helper: EthereumSmartContractHelper,
        private svc: TokenBridgeService,
        private bgs: BridgeConfigStorage
    ) {
    }
    __name__(): string { return 'TokenBridgeHttpHandler'; }

    async handle(req: JsonRpcRequest, userId?: string): Promise<any> {
        console.log('Calling command on bridge: ', )
        switch (req.command) {
            case 'withdrawSignedGetTransaction':
                ValidationUtils.isTrue(!!userId, 'user must be signed in');
                return this.withdrawSignedGetTransaction(req, userId!);
            case 'addLiquidityGetTransaction':
                ValidationUtils.isTrue(!!userId, 'user must be signed in');
                return this.addLiquidityGetTransaction(req, userId!);
            case 'removeLiquidityIfPossibleGetTransaction':
                ValidationUtils.isTrue(!!userId, 'user must be signed in');
                return this.removeLiquidityIfPossibleGetTransaction(req, userId!);
            case 'getUserPairedAddress':
                ValidationUtils.isTrue(!!userId, 'user must be signed in');
                return this.getUserPairedAddress(req, userId!);
            case 'getLiquidity':
                return this.getLiquidity(req);
            case 'getAvaialableLiquidity':
                return this.getAvailableLiquidity(req);
            case 'getTokenAllowance':
                return this.getLiquidity(req);
            case 'getUserWithdrawItems':
                ValidationUtils.isTrue(!!userId, 'user must be signed in');
                return this.getUserWithdrawItems(req, userId!);
            case 'updateWithdrawItemAddTransaction':
                ValidationUtils.isTrue(!!userId, 'user must be signed in');
                return this.updateWithdrawItemAddTransaction(req);
            case 'updateUserPairedAddress':
                ValidationUtils.isTrue(!!userId, 'user must be signed in');
                return this.updateUserPairedAddress(req);
            case 'unpairUserPairedAddress':
                ValidationUtils.isTrue(!!userId, 'user must be signed in');
                return this.unpairUserPairedAddress(req);
            case 'swapGetTransaction':
                ValidationUtils.isTrue(!!userId, 'user must be signed in');
                return this.swapGetTransaction(req, userId!);
            case 'GetSwapTransactionStatus':
                return this.getSwapTransactionStatus(req);
            case 'getSourceCurrencies':
                return this.bgs.getSourceCurrencies(req.data.network)
            default:
                return;
        }
    }

    async removeLiquidityIfPossibleGetTransaction(req: JsonRpcRequest, userId: string) {
        const {
            currency, amount
        } = req.data;
        ValidationUtils.isTrue(!!currency, "'currency' must be provided");
        ValidationUtils.isTrue(!!amount, "'amount must be provided");
        return this.svc.removeLiquidityIfPossibleGetTransaction(userId, currency, amount);
    }

    async getLiquidity(req: JsonRpcRequest) {
        const {
            currency, userAddress
        } = req.data;
        ValidationUtils.isTrue(!!currency, "'currency' must be provided");
        ValidationUtils.isTrue(!!userAddress, "'addres' must be provided");
        return this.svc.getLiquidity(userAddress, currency);
    }

    async getTokenAllowance(req: JsonRpcRequest) {
        const {
            currency, userAddress
        } = req.data;
        ValidationUtils.isTrue(!!currency, "'currency' must be provided");
        ValidationUtils.isTrue(!!userAddress, "'addres' must be provided");
        return this.svc.getTokenAllowance(userAddress, currency);
    }

    async getAvailableLiquidity(req: JsonRpcRequest) {
        const {
            currency, userAddress
        } = req.data;
        ValidationUtils.isTrue(!!currency, "'currency' must be provided");
        ValidationUtils.isTrue(!!userAddress, "'addres' must be provided");
        return this.svc.getAvailableLiquidity(currency);
    }


    async getUserWithdrawItems(req: JsonRpcRequest, userId: string) {
        const {
            network,
        } = req.data;
        ValidationUtils.isTrue(!!network, "'network' must be provided");
        const items = await this.svc.getUserWithdrawItems(network, userId.toLowerCase());
        return { 'withdrawableBalanceItems': items};
    }

    async updateWithdrawItemAddTransaction(req: JsonRpcRequest) {
        const {
            id, transactionId,
        } = req.data;
        ValidationUtils.isTrue(!!id, "'id' must be provided");
        ValidationUtils.isTrue(!!transactionId, "'transactionId' must be provided");
        return this.svc.updateWithdrawItemAddTransaction(id, transactionId);
    }

    async getSwapTransactionStatus(req: JsonRpcRequest) {
        const {
            tid,sendNetwork,timestamp
        } = req.data;
        ValidationUtils.isTrue(!!tid, "tid not found.");
        ValidationUtils.isTrue(!!sendNetwork, "sendNetwork not found.");
        ValidationUtils.isTrue(!!timestamp, "timestamp not found.");
        return this.svc.getSwapTransactionStatus(tid,sendNetwork,timestamp);
    }

    async updateUserPairedAddress(req: JsonRpcRequest) {
        const {
            pair
        } = req.data;
        ValidationUtils.isTrue(!!pair, "'pair' must be provided");
        return this.svc.updateUserPairedAddress(pair);
    }

    async unpairUserPairedAddress(req: JsonRpcRequest) {
        const {
            pair
        } = req.data;
        ValidationUtils.isTrue(!!pair, "'pair' must be provided");
        return this.svc.unpairUserPairedAddress(pair);
    }

    async getUserPairedAddress(req: JsonRpcRequest, userId: string) {
        const {
            network
        } = req.data;
        ValidationUtils.isTrue(!!network, "'network' must be provided");
        return { pairedAddress: await this.svc.getUserPairedAddress(network, userId) };
    }

    async addLiquidityGetTransaction(req: JsonRpcRequest, userId: string) {
        const {
            currency, amount
        } = req.data;
        ValidationUtils.isTrue(!!currency, "'currency' must be provided");
        ValidationUtils.isTrue(!!amount, "'amount must be provided");
        return this.svc.addLiquidityGetTransaction(userId, currency, amount);
    }

    async withdrawSignedGetTransaction(req: JsonRpcRequest, userId: string) {
        const {
            id
        } = req.data;
        return this.svc.withdrawSignedGetTransaction(id, userId);
    }

    async swapGetTransaction(req: JsonRpcRequest, userId: string) {
        const {
            currency, amount, targetCurrency
        } = req.data;
        return this.svc.swapGetTransaction(userId, currency, amount, targetCurrency);
    }
}