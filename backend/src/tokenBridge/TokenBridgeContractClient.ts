import { EthereumSmartContractHelper } from 'aws-lambda-helper/dist/blockchain';
import {abi as bridgeAbi} from './resources/BridgePool.json';
//@ts-ignore
import abiDecoder from 'abi-decoder';
import { HexString, Injectable, ValidationUtils } from 'ferrum-plumbing';
import { CustomTransactionCallRequest } from 'unifyre-extension-sdk';
import { CHAIN_ID_FOR_NETWORK, PayBySignatureData, UserBridgeWithdrawableBalanceItem } from './TokenBridgeTypes';
import { ChainUtils } from 'ferrum-chain-clients';
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

    async withdrawSignedVerify(targetCurrency: string, payee: string, amount: string,
        hash: string, salt: string, signature: string, expectedAddress: string) {
        const [network, token] = EthereumSmartContractHelper.parseCurrency(targetCurrency);
        const amountInt = await this.helper.amountToMachine(targetCurrency, amount);
        console.log('Pre Result of withdrawSignedVerify', {targetCurrency, payee, amount, hash, salt, signature});
        const res = await this.instance(network).methods.withdrawSignedVerify(token, payee, amountInt,
            salt, signature).call();
        console.log('Result of withdrawSignedVerify', res);
        ValidationUtils.isTrue(res[0] === hash, 'Invalid hash - cannot verify');
        ValidationUtils.isTrue(ChainUtils.addressesAreEqual(network as any, res[1], expectedAddress),
            `Invalid signature: expected ${expectedAddress}. Got ${res[1]}`);
    }

    protected bridgePool(network: string, contractAddress: string) {
        const web3 = this.helper.web3(network);
        return new web3.Contract(bridgeAbi as any, contractAddress);
    }

    async estimateGasOrDefault(method: any, from: string, defaultGas?: number) {
        try {
            return await method.estimateGas({from});
        } catch(e) {
            console.info('Error estimating gas. Tx might be reverting');
            return defaultGas;
        }
    }

    async withdrawSigned(w: UserBridgeWithdrawableBalanceItem,
            from: string): Promise<CustomTransactionCallRequest>{
        console.log(`About to withdrawSigned`, w);
        const address = this.contractAddress[w.sendNetwork];
        const p = this.instance(w.sendNetwork).methods.withdrawSigned(w.payBySig.token, w.payBySig.payee,
            w.payBySig.amount, w.payBySig.salt, w.payBySig.signature);
        const gas = await this.estimateGasOrDefault(p, from, undefined as any);
        const nonce = await this.helper.web3(w.sendNetwork).getTransactionCount(from, 'pending');
        return Helper.callRequest(address,
                w.sendCurrency,
                from,
                p.encodeABI(),
                gas ? gas.toFixed() : undefined,
                nonce,
                `Withdraw `);
    }

    async approveIfRequired(userAddress: string, currency: string, amount: string):
        Promise<CustomTransactionCallRequest[]> {
        const [network, __] = Helper.parseCurrency(currency);
        const address = this.contractAddress[network];
        ValidationUtils.isTrue(!!address, `No address for network ${network}`)
        const [_, requests] = await this.helper.approveMaxRequests(
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
        const gas = await this.estimateGasOrDefault(p, userAddress);
        const nonce = await this.helper.web3(network).getTransactionCount(userAddress, 'pending');
        const address = this.contractAddress[network];
        return Helper.callRequest(address,
                currency,
                userAddress,
                p.encodeABI(),
                gas ? gas.toFixed() : undefined,
                nonce,
                `Add liquidity `);
    }

    async removeLiquidityIfPossible(userAddress: string, currency: string, amount: string) {
        const [network, token] = Helper.parseCurrency(currency);
        const amountRaw = await this.helper.amountToMachine(currency, amount);
        const p = this.instance(network).methods.removeLiquidityIfPossible(token, amountRaw);
        const gas = await this.estimateGasOrDefault(p, userAddress);
        const nonce = await this.helper.web3(network).getTransactionCount(userAddress, 'pending');
        const address = this.contractAddress[network];
        return Helper.callRequest(address,
                currency,
                userAddress,
                p.encodeABI(),
                gas ? gas.toFixed() : undefined,
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
        console.log('About to call swap', {token,  targetNetworkInt, targetToken});
        const amountRaw = await this.helper.amountToMachine(currency, amount);
        console.log('About to call swap', {token, amountRaw, targetNetworkInt, targetToken});
        const p = this.instance(network).methods.swap(token, amountRaw, targetNetworkInt, targetToken);
        const gas = await this.estimateGasOrDefault(p, userAddress, undefined);
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
        return this.helper.amountToHuman(currency,p);
    }

    async getTokenAllowance(userAddress: string, currency: string): Promise<string> {
        const [network, token] = Helper.parseCurrency(currency);
        const p = await this.instance(network).methods.getAllowance(userAddress, userAddress).call();
        return this.helper.amountToHuman(currency,p);
    }

    async getAvaialableLiquidity(currency: string){
        const [network, token] = Helper.parseCurrency(currency);
        const p = await this.helper.erc20(network, token).methods.balanceOf(this.contractAddress[network]).call();
        return this.helper.amountToHuman(currency,p);
    }
}