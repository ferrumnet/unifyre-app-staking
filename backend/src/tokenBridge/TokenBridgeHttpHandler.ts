import { LambdaHttpRequest, LambdaHttpResponse } from "aws-lambda-helper";
import { Injectable, JsonRpcRequest, ValidationUtils } from "ferrum-plumbing";
import { TokenBridgeService } from "./TokenBridgeService";

export class TokenBridgeHttpHandler implements Injectable {
    constructor(
        private svc: TokenBridgeService,
    ) {
    }
    __name__(): string { return 'TokenBridgeHttpHandler'; }

    async handle(req: JsonRpcRequest, userId?: string): Promise<any> {
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
            case 'getUserWithdrawItems':
                ValidationUtils.isTrue(!!userId, 'user must be signed in');
                return this.getUserWithdrawItems(req, userId!);
            case 'updateWithdrawItemAddTransaction':
                ValidationUtils.isTrue(!!userId, 'user must be signed in');
                return this.updateWithdrawItemAddTransaction(req);
            case 'updateUserPairedAddress':
                ValidationUtils.isTrue(!!userId, 'user must be signed in');
                return this.updateUserPairedAddress(req);
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
            currency, address
        } = req.data;
        ValidationUtils.isTrue(!!currency, "'currency' must be provided");
        ValidationUtils.isTrue(!!address, "'addres' must be provided");
        return this.svc.getLiquidity(address, currency);
    }

    async getUserWithdrawItems(req: JsonRpcRequest, userId: string) {
        const {
            network,
        } = req.data;
        ValidationUtils.isTrue(!!network, "'network' must be provided");
        return this.svc.getUserWithdrawItems(network, userId);
    }

    async updateWithdrawItemAddTransaction(req: JsonRpcRequest) {
        const {
            id, transactionId,
        } = req.data;
        ValidationUtils.isTrue(!!id, "'id' must be provided");
        ValidationUtils.isTrue(!!transactionId, "'transactionId' must be provided");
        return this.svc.updateWithdrawItemAddTransaction(id, transactionId);
    }

    async updateUserPairedAddress(req: JsonRpcRequest) {
        const {
            pair
        } = req.data;
        ValidationUtils.isTrue(!!pair, "'pair' must be provided");
        return this.svc.updateUserPairedAddress(pair);
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
}