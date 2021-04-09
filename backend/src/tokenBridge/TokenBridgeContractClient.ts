import { EthereumSmartContractHelper } from 'aws-lambda-helper/dist/blockchain';
import {abi as bridgeAbi} from './resources/BridgePool.json';
//@ts-ignore
import abiDecoder from 'abi-decoder';
import { HexString, Injectable, ValidationUtils } from 'ferrum-plumbing';
import { CustomTransactionCallRequest } from 'unifyre-extension-sdk';
import { CHAIN_ID_FOR_NETWORK, PayBySignatureData, UserBridgeWithdrawableBalanceItem } from './TokenBridgeTypes';
const Helper = EthereumSmartContractHelper;

export class TokenBridgeContractClinet implements Injectable {
    constructor(
        private helper: EthereumSmartContractHelper,
        private contractAddress: {[network: string]: string},
    ) {
        abiDecoder.addABI(bridgeAbi);
    }

    __name__() { return 'TokenBridgeContractClinet'; }

    private instance(network: string){
        const address = this.contractAddress[network];
        ValidationUtils.isTrue(!!address, `No address for network ${network}`)
        return this.bridgePool(network, address);
    }

    protected bridgePool(network: string, contractAddress: string) {
        const web3 = this.helper.web3(network);
        return new web3.Contract(bridgeAbi, contractAddress);
    }

    async withdrawSigned(w: UserBridgeWithdrawableBalanceItem,
            from: string): Promise<CustomTransactionCallRequest>{
        console.log(`About to withdrawSigned`, w);
        const address = this.contractAddress[w.sendNetwork];
        const p = this.instance(w.sendNetwork).methods.withdrawSigned(w.payBySig.token, w.payBySig.payee,
            w.payBySig.amount, w.payBySig.salt, w.payBySig.signature);
        const gas = await p.estimateGas({from});
        const nonce = await this.helper.web3(w.sendNetwork).getTransactionCount(from, 'pending');
        return Helper.callRequest(address,
                w.sendCurrency,
                from,
                p.encodeABI(),
                gas.toFixed(),
                nonce,
                `Withdraw `);
    }

    async approveIfRequired(userAddress: string, currency: string, amount: string):
        Promise<CustomTransactionCallRequest[]> {
        const [network, __] = Helper.parseCurrency(currency);
        const address = this.contractAddress[network];
        ValidationUtils.isTrue(!!address, `No address for network ${network}`)
        const [_, requests] = await this.helper.approveRequests(
            currency,
            userAddress,
            amount,
            this.contractAddress[network],
            'TokenBridgePool',
        );
        return requests;
    }

    async addLiquidity(userAddress: string, currency: string, amount: string):
        Promise<CustomTransactionCallRequest> {
        const [network, token] = Helper.parseCurrency(currency);
        const amountRaw = await this.helper.amountToMachine(currency, amount);
        const p = this.instance(network).methods.addLiquidity(token, amountRaw);
        const gas = await p.estimateGas({from: userAddress});
        const nonce = await this.helper.web3(network).getTransactionCount(userAddress, 'pending');
        const address = this.contractAddress[network];
        return Helper.callRequest(address,
                currency,
                userAddress,
                p.encodeABI(),
                gas.toFixed(),
                nonce,
                `Add liquidity `);
    }

    async removeLiquidityIfPossible(userAddress: string, currency: string, amount: string) {
        const [network, token] = Helper.parseCurrency(currency);
        const amountRaw = await this.helper.amountToMachine(currency, amount);
        const p = this.instance(network).methods.removeLiquidityIfPossible(token, amountRaw);
        const gas = await p.estimateGas({from: userAddress});
        const nonce = await this.helper.web3(network).getTransactionCount(userAddress, 'pending');
        const address = this.contractAddress[network];
        return Helper.callRequest(address,
                currency,
                userAddress,
                p.encodeABI(),
                gas.toFixed(),
                nonce,
                `Remove liquidity `);
    }

    async swap(userAddress: string, currency: string, amount: string, targetCurrency: string) {
        const [network, token] = Helper.parseCurrency(currency);
        const [targetNetwork, targetToken] = Helper.parseCurrency(targetCurrency);
        const targetNetworkInt = CHAIN_ID_FOR_NETWORK[targetNetwork];
        ValidationUtils.isTrue(!!targetNetworkInt, "'targetNetwork' must be provided");
        ValidationUtils.isTrue(!!userAddress, "'userAddress' must be provided");
        ValidationUtils.isTrue(!!amount, "'amount' must be provided");
        const amountRaw = await this.helper.amountToMachine(currency, amount);
        const p = this.instance(network).methods.swap(token, amountRaw, targetNetworkInt, targetToken);
        const gas = await p.estimateGas({from: userAddress});
        const nonce = await this.helper.web3(network).getTransactionCount(userAddress, 'pending');
        const address = this.contractAddress[network];
        return Helper.callRequest(address,
                currency,
                userAddress,
                p.encodeABI(),
                gas.toFixed(),
                nonce,
                `Swap `);
    }

    async getLiquidity(userAddress: string, currency: string): Promise<string> {
        const [network, token] = Helper.parseCurrency(currency);
        const p = await this.instance(network).methods.liquidity(token, userAddress).call();
        return p.toString();
    }
}