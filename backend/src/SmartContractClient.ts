import { Injectable, HexString, LocalCache, ValidationUtils, Network } from "ferrum-plumbing";
// @ts-ignore
import * as erc20Abi from './resources/IERC20.json'
// @ts-ignore
import * as poolDropAbi from './resources/StakingApp.json';
// import { Eth } from 'web3-eth';
import Web3 from 'web3';
import Big from 'big.js';
import { CustomTransactionCallRequest } from "unifyre-extension-sdk";
import { timeStamp } from "console";

//@ts-nocheck

  

export class SmartContratClient implements Injectable {
    cache: LocalCache;
    constructor(
        private web3ProviderEthereum: string,
        private web3ProviderRinkeby: string,
        private stakingAppContract: { [network: string]: string},
        private stakingTokenContract: string
    ) {
        this.cache = new LocalCache();

    }

    __name__() { return 'SmartContratClient'; }

    async instance(currency: string){
        const network = currency.split(':')[0];
        return this.stakingApp(network);
    }

    

    async checkAllowance(
        currency: string,
        userAddress:string,
        amount:number,
    ): Promise<any> {
        const network = currency.split(':')[0];
        const contract = this.stakingAppContract[network];
        const instance = await this.stakingApp(network);
        const erc2 = await this.erc20(network,this.stakingTokenContract);
        console.log('contractToken',this.stakingTokenContract);
        let name = await this.stakingApp(network).methods.tokenName().call();
        let er = await erc2.methods.INITIAL_SUPPLY().call();
        console.log(name,'stakingContractName',er);
        ValidationUtils.isTrue(!!contract, 'No contract address is configured for this network');
        let allowance = await this.allowance(userAddress, this.stakingTokenContract,network);
        try {
            allowance = await this.allowance(userAddress,this.stakingTokenContract,network);
            console.log(allowance,'allowance====',!allowance,contract);
            if (allowance) {
                console.log('About to approve for amount.', amount);
                const [approve, approveGas] = await this.approve(network,this.stakingAppContract[network], contract, amount);
                console.log('Approve was successful, now doing some moew.')
                const nonce = await this.web3(network).getTransactionCount(userAddress, 'pending');
                console.log(nonce,'pppppp');
                return [];
            }
        } catch (error) {
            console.log('Unable to approve the stake, try again',error);
            return;
        }
    }

    async contractInfo (currency:string){
        const network = currency.split(':')[0];
        const erc2 = await this.erc20(network,this.stakingTokenContract);
        let symbol = await erc2.methods.symbol().call();
        return {
            symbol
        }
    }

   

    private async approve(network: string, token: string,from: string,amount:Number): Promise<any> {
        const erc2 = await this.erc20(network,this.stakingTokenContract);
        console.log('contractToken',this.stakingTokenContract);
        let name = await this.stakingApp(network).methods.tokenName().call();
        let er = await erc2.methods.INITIAL_SUPPLY().call();
        let initial = await erc2.methods.INITIAL_SUPPLY().call();
        const m = await erc2.methods.approve(this.stakingAppContract[network], amount.toFixed());
        const gas = await m.estimateGas({from});
        console.log('APPROVE', gas);
        return [m.encodeABI(), gas]; 
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
        return new web3.Contract(erc20Abi.abi, token);
    }

    private stakingApp(network: string) {
        const contractAddress = this.stakingAppContract[network];
        const web3 = this.web3(network);
        return new web3.Contract(poolDropAbi.abi as any, contractAddress);
    }

    async balanceOf(address:string,network: string, token: string) {
        return this.rawToAmount(network,await this.erc20(network, token).methods.balanceOf(address).call());
    }
    
    async allowance(userAddress:string, contractAddress:string,network: string) {
        return await this.erc20(network,contractAddress).methods.allowance(userAddress, contractAddress).call();
    }

    async amountToRaw(amount:number,network:string,contractAddress:string) {
        const erc2 = await this.erc20(network,this.stakingTokenContract);
        console.log('contractToken',this.stakingTokenContract);
        let er = await erc2.methods.INITIAL_SUPPLY().call();
        let decimal = await this.erc20(network,contractAddress).methods.decimals().call();
        console.log(decimal,'illl====')
        return amount * (10 ** decimal);
    }

    async stake(stakerAddress:string, amount:number,network:string) {
        const rawAmount = await this.amountToRaw(amount,network,this.stakingTokenContract);
        let contractInstance = await this.instance(network);
        let instance = await contractInstance.methods.stake(29);
        console.log('ABOUT TO CALL STAKE', rawAmount)
        try{
            let stakeResponse = await this.stakingApp('ETHEREUM').methods.stake(amount,stakerAddress).call();
        }catch (error) {
            console.log('Error occured staking , try again', error);
            return;
        }
    }    
      
    async rawToAmount(network: any,raw: string) {
        let decimal = await this.decimals(network,raw);
        return Number(raw) / (10 ** decimal);
    }
    
}