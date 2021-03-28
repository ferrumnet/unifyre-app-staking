import { EthereumSmartContractHelper } from 'aws-lambda-helper/dist/blockchain';
import {abi as bridgeAbi} from './resources/BridgePool.json';
//@ts-ignore
import abiDecoder from 'abi-decoder';
import { HexString, ValidationUtils } from 'ferrum-plumbing';
import { CustomTransactionCallRequest } from 'unifyre-extension-sdk';
const Helper = EthereumSmartContractHelper;

export class TokenBridgeContractClinet {
    constructor(
        private helper: EthereumSmartContractHelper,
        private contractAddress: {[network: string]: string},
    ) {
        abiDecoder.addABI(bridgeAbi);
    }

    private instance(network: string){
        const address = this.contractAddress[network];
        ValidationUtils.isTrue(!!address, `No address for network ${network}`)
        return this.bridgePool(network, address);
    }

    protected bridgePool(network: string, contractAddress: string) {
        const web3 = this.helper.web3(network);
        return new web3.Contract(bridgeAbi, contractAddress);
    }

    async withdrawSigned(
        currency: string, userAddress: string, amount: string, salt: string, signature: string):
        Promise<[HexString, number]>{
        console.log(`About to withdrawSigned`, {currency, amount, salt, signature});
        const [network, token] = Helper.parseCurrency(currency);
        const amountRaw = await this.helper.amountToMachine(currency, amount);
        const p = this.instance(network).methods.withdrawSigned(token, userAddress,
            amountRaw, salt, signature);
        const gas = await p.estimateGas({from: userAddress});
        return [p.encodeABI(), gas];
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

    async getLiquidity(userAddress: string, currency: string): Promise<string> {
        const [network, token] = Helper.parseCurrency(currency);
        const p = await this.instance(network).methods.liquidity(token, userAddress).call();
        return p.toString();
    }
}