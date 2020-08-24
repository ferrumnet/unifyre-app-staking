import { Injectable, HexString, ValidationUtils } from "ferrum-plumbing";
import stakingAbi from './resources/Festaking-abi.json';
import Big from 'big.js';
import { StakingApp } from "./Types";
import { EthereumSmartContractHelper } from 'aws-lambda-helper/dist/blockchain';
import { CustomTransactionCallRequest } from "unifyre-extension-sdk";
const Helper = EthereumSmartContractHelper;

const STAKE_GAS = 200000;

export class SmartContratClient implements Injectable {
    constructor(
        public helper: EthereumSmartContractHelper,
    ) {
    }

    __name__() { return 'SmartContratClient'; }

    private instance(network: string, address: string){
        return this.stakingApp(network, address);
    }

    async checkAllowanceAndStake(
        stakingContract: StakingApp,
        userAddress: string,
        amount: string,
    ): Promise<CustomTransactionCallRequest[]> {
        ValidationUtils.isTrue(!!stakingContract, '"stakingContract" must be provided');
        ValidationUtils.isTrue(!!userAddress, '"userAddress" must be provided');
        ValidationUtils.isTrue(!!amount, '"amount" must be provided');
        const { name, network, contractAddress, currency, symbol } = stakingContract;
        const [nonce, requests] = await this.helper.approveRequests(
            currency,
            userAddress,
            amount,
            contractAddress,
            name,
        );
        const [staking, stakingGas] = await this.stakeToken(
            network,
            contractAddress,
            currency,
            userAddress,
            amount);
        requests.push(
            Helper.callRequest(contractAddress, currency, userAddress, staking, stakingGas.toFixed(), nonce,
                `${amount} ${symbol} to be staked into ${name}`,),
        );
        return requests;
    }

    async unStake(
        stakingContract: StakingApp,
        userAddress: string,
        amount: string,
    ): Promise<CustomTransactionCallRequest[]> {
        ValidationUtils.isTrue(!!stakingContract, '"stakingContract" must be provided');
        ValidationUtils.isTrue(!!userAddress, '"userAddress" must be provided');
        ValidationUtils.isTrue(!!amount, '"amount" must be provided');
        const { name, network, contractAddress, currency, symbol } = stakingContract;
        const stakeOf = await this.stakeOf(network, contractAddress, currency, userAddress);
        ValidationUtils.isTrue(new Big(stakeOf).lte(new Big(amount)),
            `Not enough stake balance to unstake from. Current stake balance is ${stakeOf} but ${amount} was requested.`);
        const nonce = await this.helper.web3(network).getTransactionCount(userAddress, 'pending');
        const [unstake, unstakeGas] = await this.unstakeToken(
            network,
            contractAddress,
            currency,
            userAddress,
            amount);
        const requests: CustomTransactionCallRequest[] = [];
        requests.push(
            Helper.callRequest(contractAddress, currency, userAddress, unstake, unstakeGas.toFixed(), nonce,
                `To un-stake ${amount} ${symbol} from ${name}`,),
        );
        return requests;
    }

    async contractInfo(network:string, contract: string): Promise<StakingApp> {
        const inst = this.instance(network, contract);
        const contractInstance = inst.methods;
        const tokenAddress = (await contractInstance.tokenAddress().call()).toString().toLowerCase();
        const currency = Helper.toCurrency(network, tokenAddress);
        const symbol = await this.helper.symbol(currency);
        const name = (await contractInstance.name().call()).toString();
        const stakedBalanceRaw = (await contractInstance.stakedBalance().call()).toString();
        const rewardBalanceRaw = (await contractInstance.rewardBalance().call()).toString();
        const stakingCapRaw = (await contractInstance.stakingCap().call()).toString();
        const stakedTotalRaw = (await contractInstance.stakedTotal().call()).toString();
        const earlyWithdrawRewardRaw = (await contractInstance.earlyWithdrawReward().call()).toString();
        console.log('STAKED NUMBER', {stakedBalanceRaw, rewardBalanceRaw, stakingCapRaw, stakedTotalRaw})
        const totalRewardRaw = (await contractInstance.totalReward().call()).toString();
        const withdrawStarts = (await contractInstance.withdrawStarts().call());
        const withdrawEnds = (await contractInstance.withdrawEnds().call());
        const stakingStarts = (await contractInstance.stakingStarts().call());
        const stakingEnds = (await contractInstance.stakingEnds().call());
        return {
            network,
            currency,
            symbol,
            contractAddress: contract,
            name,
            tokenAddress,
            stakedBalance: await this.helper.amountToHuman(currency, stakedBalanceRaw),
            rewardBalance: await this.helper.amountToHuman(currency, rewardBalanceRaw),
            stakingCap: await this.helper.amountToHuman(currency, stakingCapRaw),
            stakedTotal: await this.helper.amountToHuman(currency, stakedTotalRaw),
            earlyWithdrawReward: await this.helper.amountToHuman(currency, earlyWithdrawRewardRaw),
            totalReward: await this.helper.amountToHuman(currency, totalRewardRaw),
            withdrawStarts,
            withdrawEnds,
            stakingStarts,
            stakingEnds,
        } as StakingApp;
    }

    async stakeOf(network: string, contractAddress: string, currency: string, address: string) {
        const val = await this.instance(network, contractAddress).methods.stakeOf(address).call();
        return this.helper.amountToHuman(currency, val.toString());
    }

    private stakingApp(network: string, contractAddress: string) {
        const web3 = this.helper.web3(network);
        return new web3.Contract(stakingAbi, contractAddress);
    }

    private async stakeToken(network: string,
        contractAddress: string,
        currency: string,
        userAddress: string,
        amount: string):
        Promise<[HexString, number]> {
        console.log('About to stake', {network, contractAddress, userAddress, amount});
        const amountRaw = await this.helper.amountToMachine(currency, amount);
        const m = this.stakingApp(network, contractAddress).methods.stake(amountRaw);
        const gas = STAKE_GAS;
        return [m.encodeABI(), gas];
    }

    private async unstakeToken(network: string,
        contractAddress: string,
        currency: string,
        userAddress: string,
        amount: string):
        Promise<[HexString, number]> {
        console.log('About to UNstake', {network, contractAddress, userAddress, amount});
        const amountRaw = await this.helper.amountToMachine(currency, amount);
        const m = this.stakingApp(network, contractAddress).methods.withdraw(amountRaw);
        const gas = await m.estimateGas({from: userAddress});
        return [m.encodeABI(), gas];
    }
}