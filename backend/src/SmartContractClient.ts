import { Injectable, HexString, LocalCache, ValidationUtils, Network } from "ferrum-plumbing";
// @ts-ignore
import * as erc20Abi from './resources/IERC20.json'
// @ts-ignore
import * as poolDropAbi from './resources/StakingApp.json';
// import { Eth } from 'web3-eth';
import Web3 from 'web3';
import Big from 'big.js';
import { CustomTransactionCallRequest } from "unifyre-extension-sdk";

export class SmartContratClient implements Injectable {
    cache: LocalCache;
    constructor(
        private web3ProviderEthereum: string,
        private web3ProviderRinkeby: string,
        private stakingAppContract: { [network: string]: string},
    ) {
        this.cache = new LocalCache();
    }

    __name__() { return 'SmartContratClient'; }

    async stakeToken(
        token: string,
        currency: string,
    ): Promise<any> {
        const network = currency.split(':')[0];
        const contract = this.stakingAppContract['ETHEREUM'];
        ValidationUtils.isTrue(!!contract, 'No contract address is configured for this network');
        const instance = await this.approve(network, contract);
        //const nonce = await this.web3(network).getTransactionCount(from, 'pending');
        // const fullAmountHuman = (decimalFactor).toFixed();
        return [];
    }

    private async approve(network: string, token: string): Promise<any> {
        const m = this.erc20(network, token)
        return m  
    }

    private web3(network: string) {
        return new Web3(new Web3.providers.HttpProvider(
            network === 'ETHEREUM' ? this.web3ProviderEthereum : this.web3ProviderRinkeby)).eth;
    }

    private async decimals(network: string, token: string): Promise<number> {
        return this.cache.getAsync('DECIMALS_' + token, async () => {
            const tokenCon = this.erc20(network, token);
            return await tokenCon.methods.decimals().call();
        });
    }

    private erc20(network: string, token: string) {
        const web3 = this.web3(network);
        return new web3.Contract(erc20Abi.default, token);
    }

    private stakingApp(network: string) {
        const web3 = this.web3(network);
        return new web3.Contract(poolDropAbi.abi as any, this.stakingAppContract[network]);
    }
}

function callRequest(contract: string, currency: string, from: string, data: string, gasLimit: string, nonce: number,
    description: string): CustomTransactionCallRequest {
    return {
        currency,
        from,
        amount: '0',
        contract,
        data,
        gas: { gasPrice: '0', gasLimit },
        nonce,
        description,
    };
}