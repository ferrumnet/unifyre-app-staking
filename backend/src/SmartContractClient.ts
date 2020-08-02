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
        private poolDropContract: { [network: string]: string},
    ) {
        this.cache = new LocalCache();
    }

    __name__() { return 'SmartContratClient'; }

    private web3(network: string) {
        return new Web3(new Web3.providers.HttpProvider(
            network === 'ETHEREUM' ? this.web3ProviderEthereum : this.web3ProviderRinkeby)).eth;
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