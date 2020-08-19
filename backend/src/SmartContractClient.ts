import { Injectable, HexString, LocalCache, ValidationUtils, Network } from "ferrum-plumbing";
// @ts-ignore
import * as erc20Abi from './resources/ERC20.json'
// @ts-ignore
import * as stakingAbi from './resources/Staking.json';
// import { Eth } from 'web3-eth';
import Web3 from 'web3';
import Big from 'big.js';
import { CustomTransactionCallRequest } from "unifyre-extension-sdk";
import { timeStamp } from "console";
import { unwatchFile } from "fs";

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
        const contract = this.stakingAppContract[network];
        return this.stakingApp(network);
    }

    async checkAllowanceAndStake(
        currency: string,
        symbol: string,
        userAddress:string,
        amount:number,
    ): Promise<any> {
        let token = currency.split(':')[1];
        let network = 'RINKEBY';
        const contract = this.stakingAppContract[network];
        ValidationUtils.isTrue(!!contract, 'No contract address is configured for this network');
        const decimalFactor = 10 ** 0.000322;
        const amountToStake = new Big(amount).times(new Big(decimalFactor)).round(0, 0);
        const [approve, approveGas] = await this.approve(network, token, userAddress, amount);
        const [staking, stakingGas] = await this.stakeToken(network, token, userAddress, amountToStake);
        const nonce = await this.web3(network).getTransactionCount(userAddress, 'pending');
        const fullAmount = amountToStake.div(decimalFactor).toFixed();
        console.log('contractToken',this.stakingTokenContract);
        let name = await this.stakingApp(network).methods.tokenAddress().call();
        let allowance
        try {
            allowance = await this.allowance(userAddress,this.stakingTokenContract,network);
                console.log('About to approve for amount.', amount);
                console.log('Approve was successful, now doing some moew.')
                return [
                    callRequest(token, currency, userAddress, approve, approveGas.toFixed(), nonce,
                        `Approve ${fullAmount} ${symbol} to be spent by Staking contract`,),
                    callRequest(contract, currency, userAddress, staking, stakingGas.toFixed(), nonce + 1,
                        `${amount} ${symbol} to be staked`,),
                ];    
        } catch (error) {
            console.log('Unable to approve the stake, try again',error);
            return;
        }
    }

    async checkAllowanceAndUnStake(
        currency: string,
        symbol: string,
        userAddress:string,
        amount:number,
    ): Promise<any> {
        let token = currency.split(':')[1];
        let network = 'RINKEBY';
        const contract = this.stakingAppContract[network];
        ValidationUtils.isTrue(!!contract, 'No contract address is configured for this network');
        const decimalFactor = 10 ** 0.000322;
        const amountToStake = new Big(amount).times(new Big(decimalFactor)).round(0, 0);
        const [approve, approveGas] = await this.approve(network, token, userAddress, amount);
        const [staking, stakingGas] = await this.unstakeToken(network, token, userAddress, amountToStake);
        const nonce = await this.web3(network).getTransactionCount(userAddress, 'pending');
        const fullAmount = amountToStake.div(decimalFactor).toFixed();
        console.log('contractToken',this.stakingTokenContract);
        let allowance
        try {
            allowance = await this.allowance(userAddress,this.stakingTokenContract,network);
                console.log('About to approve for amount.', amount);
                console.log('Approve was successful, now doing some moew.')
                return [
                    callRequest(token, currency, userAddress, approve, approveGas.toFixed(), nonce,
                        `Approve ${fullAmount} ${symbol} to be spent by Staking contract`,),
                    callRequest(contract, currency, userAddress, staking, stakingGas.toFixed(), nonce + 1,
                        `${amount} ${symbol} to be unstaked`,),
                ];    
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

    async userStake (userAdress:string,currency:string) {
        let token = currency.split(':')[1];
        let network = 'RINKEBY' ?? currency.split(':')[0];
        const userStake = await (await this.instance(network)).methods.stakeOf(userAdress)
        return userStake;
    }

   

    private async approve(network: string, token: string,from: string,amount:Number): Promise<any> {
        const erc2 = await this.erc20(network,this.stakingTokenContract);
        console.log('contractToken',this.stakingTokenContract);
        //let name = await this.stakingApp(network).methods.tokenName().call();
        //let er = await erc2.methods.INITIAL_SUPPLY().call();
        //let initial = await erc2.methods.INITIAL_SUPPLY().call();
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
        return new web3.Contract(stakingAbi.abi as any, contractAddress);
    }

    async balanceOf(address:string,network: string, token: string) {
        return this.rawToAmount(network,await this.erc20(network, token).methods.balanceOf(address).call());
    }
    
    async allowance(userAddress:string, contractAddress:string,network: string) {
        return await this.erc20(network,contractAddress).methods.allowance(userAddress, contractAddress).call();
    }

    async amountToRaw(amount:number,network:string,contractAddress:string) {
        const erc2 = await this.erc20(network,this.stakingTokenContract);
        console.log('contractToken',this.stakingTokenContract,erc2);
        let decimal = await this.erc20(network,contractAddress).methods.decimals().call();
        return amount * (10 ** decimal);
    }

    private async stakeToken(network: string, token: string, userAddress: string,  amount: Big):
        Promise<[HexString, number]> {
        console.log('stake', {token, userAddress, amount: amount.toFixed()});
        const m = this.stakingApp(network).methods.stake(amount.toFixed());
        const gas = 35000 + 1 * 60000;
        // await m.estimateGas({from}); This will fail unfortunately because tx will revert!
        console.log('stake', gas);
        return [m.encodeABI(), gas];
    }

    private async unstakeToken(network: string, token: string, userAddress: string,  amount: Big):
        Promise<[HexString, number]> {
        console.log('stake', {token, userAddress, amount: amount.toFixed()});
        const m = this.stakingApp(network).methods.unstake(amount.toFixed());
        const gas = 35000 + 1 * 60000;
        // await m.estimateGas({from}); This will fail unfortunately because tx will revert!
        console.log('unstake', gas);
        return [m.encodeABI(), gas];
    }

    

    async stake(amount:number,network:string) {
        const rawAmount = await this.amountToRaw(amount,network,this.stakingTokenContract);
        console.log(await this.stakingApp(network).methods.tokenAddress().call());
        console.log('ABOUT TO CALL STAKE', rawAmount)
        try{
            await this.stakingApp(network).methods.stake(amount);
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