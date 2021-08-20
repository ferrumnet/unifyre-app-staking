import { Injectable, HexString, ValidationUtils } from "ferrum-plumbing";
import stakingAbi from './resources/Festaking-abi.json';
import stakingContinuationAbi from './resources/FestakedRewardContinuation-abi.json';
import Big from 'big.js';
import { StakingApp, StakingContractType } from "./Types";
import { EthereumSmartContractHelper } from 'aws-lambda-helper/dist/blockchain';
import { CustomTransactionCallRequest } from "unifyre-extension-sdk";
//@ts-ignore
import abiDecoder from 'abi-decoder';
import { Eth } from 'web3-eth';
import { decode } from "punycode";
const Helper = EthereumSmartContractHelper;

const STAKE_GAS = 200000;

export interface StakedEvent {
    token: string;
    staker: string;
    requestedAmount: string;
    stakedAmount: string;
}

export interface PaidOutEvent {
    contractType: StakingContractType;
    token: string;
    symbol: string;
    rewardToken?: string;
    rewardSymbol?: string;
    staker: string;
    amount: string;
    reward: string;
}

export async function tryEither(fun1: () => Promise<any>, fun2: () => Promise<any>):
    Promise<[any, boolean]> {
    try {
        return [await fun1(), true];
    } catch (e) {
        return [await fun2(), false];
    }
}

export class SmartContratClient implements Injectable {
    constructor(
        public helper: EthereumSmartContractHelper,
        abi: any = stakingAbi
    ) {
        abiDecoder.addABI(abi);
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
        const { name, network, contractAddress, currency, symbol, gasLimitOverride } = stakingContract;
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
            amount,
            gasLimitOverride,
            );
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
        ValidationUtils.isTrue(new Big(stakeOf).gte(new Big(amount)),
            `Not enough stake balance to unstake from. Current stake balance is ${stakeOf} but ${amount} was requested.`);

        const requests: CustomTransactionCallRequest[] = [];
        let nonce = await this.helper.web3(network).getTransactionCount(userAddress, 'pending');
        if (stakingContract.rewardContinuationAddress) {
            const [takeRewards, takeRewardsGas] = await  this.takeContinuationRewards(
                network,
                stakingContract.rewardContinuationAddress,
                userAddress,);
            requests.push(
                Helper.callRequest(stakingContract.rewardContinuationAddress,
                    stakingContract.rewardContinuationCurrency || stakingContract.rewardCurrency || stakingContract.currency,
                    userAddress,
                    takeRewards,
                    takeRewardsGas.toFixed(),
                    nonce,
                    `To take continuation rewards from ${name}`));
            nonce ++;
        }
        const [unstake, unstakeGas] = await this.unstakeToken(
            network,
            contractAddress,
            currency,
            userAddress,
            amount);
        requests.push(
            Helper.callRequest(contractAddress, currency, userAddress, unstake, unstakeGas.toFixed(), nonce,
                `To un-stake ${amount} ${symbol} from ${name}`,),
        );
        return requests;
    }

    async takeRewards(
        stakingContract: StakingApp,
        userAddress: string,
    ): Promise<CustomTransactionCallRequest[]> {
        ValidationUtils.isTrue(!!stakingContract, '"stakingContract" must be provided');
        ValidationUtils.isTrue(!!userAddress, '"userAddress" must be provided');
        
        const { name, network, contractAddress, currency, symbol } = stakingContract;
        ValidationUtils.isTrue(!!stakingContract.rewardContinuationAddress, 'Contract has no continuation');

        const requests: CustomTransactionCallRequest[] = [];
        let nonce = await this.helper.web3(network).getTransactionCount(userAddress, 'pending');
        const [takeRewards, takeRewardsGas] = await  this.takeContinuationRewards(
            network,
            stakingContract.rewardContinuationAddress!,
            userAddress,);
        requests.push(
            Helper.callRequest(stakingContract.rewardContinuationAddress!,
                stakingContract.rewardContinuationCurrency || stakingContract.rewardCurrency || stakingContract.currency,
                userAddress,
                takeRewards,
                takeRewardsGas.toFixed(),
                nonce,
                `To take continuation rewards from ${name}`));
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
        // const totalRewardRaw = (await contractInstance.rewardsTotal().call()).toString();
        const [totalRewardRaw, hasTotalReward] = await tryEither(
                async () => await contractInstance.totalReward().call(),
                async () => await contractInstance.rewardsTotal().call(),
            );
        const withdrawStarts = (await contractInstance.withdrawStarts().call());
        const withdrawEnds = (await contractInstance.withdrawEnds().call());
        const stakingStarts = (await contractInstance.stakingStarts().call());
        const stakingEnds = (await contractInstance.stakingEnds().call());
        const result = {
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
            totalReward: await this.helper.amountToHuman(currency, totalRewardRaw.toString()),
            withdrawStarts,
            withdrawEnds,
            stakingStarts,
            stakingEnds,
            legacy: hasTotalReward,
        } as any as StakingApp;
        return await this.populateFurtherContractInfo(inst, result);
    }

    protected async populateFurtherContractInfo(_: any, result: StakingApp): Promise<StakingApp> {
        return result;
    }

    async stakeOf(network: string, contractAddress: string, currency: string, address: string) {
        const val = await this.instance(network, contractAddress).methods.stakeOf(address).call();
        return this.helper.amountToHuman(currency, val.toString());
    }

    async continuationRewardsOf(network: string, contractAddress: string,
        currency: string, address: string) {
        const val = await this.stakingContinuationApp(network, contractAddress)
            .methods.rewardOf(address).call();
        return await this.helper.amountToHuman(currency, val.toString());
    }

    async transactionLog(network: string, transactionId: string): Promise<[StakedEvent|undefined, PaidOutEvent|undefined]> {
        const web3 = this.helper.web3(network) as Eth;
        const rec = await web3.getTransactionReceipt(transactionId);
        if (!rec) { return [undefined, undefined]};
        return this.processLog(network, rec.logs);
    }

    protected stakingContinuationApp(network: string, contractAddress: string) {
        const web3 = this.helper.web3(network);
        return new web3.Contract(stakingContinuationAbi as any, contractAddress);
    }

    protected stakingApp(network: string, contractAddress: string) {
        const web3 = this.helper.web3(network);
        return new web3.Contract(stakingAbi as any, contractAddress);
    }

    private async stakeToken(network: string,
        contractAddress: string,
        currency: string,
        userAddress: string,
        amount: string,
        gasLimitOverride?: string,):
        Promise<[HexString, number]> {
        console.log('About to stake', {network, contractAddress, userAddress, amount});
        const amountRaw = await this.helper.amountToMachine(currency, amount);
        const m = this.stakingApp(network, contractAddress).methods.stake(amountRaw);
        const gas = Number(gasLimitOverride) || STAKE_GAS;
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

    private async takeContinuationRewards(network: string,
        continuationContractAddress: string,
        userAddress: string,):
        Promise<[HexString, number]> {
        console.log('About to take continuation', {network, continuationContractAddress, userAddress});
        const m = this.stakingContinuationApp(network, continuationContractAddress)
            .methods.withdrawRewards();
        const gas = await m.estimateGas({from: userAddress});
        return [m.encodeABI(), gas];
    }

    private async processLog(network: string, logs: any[]): Promise<[StakedEvent|undefined, PaidOutEvent|undefined]> {
        const decoded = abiDecoder.decodeLogs(logs);
        const stakedRaw = decoded.find((l: any) => l?.name === 'Staked');
        const paidOutRaw = decoded.find((l: any) => l?.name === 'PaidOut');
        console.log('DECODED ISO', decode, {stakedRaw, paidOutRaw});
        let staked: StakedEvent | undefined = undefined;
        let paidOut: PaidOutEvent | undefined = undefined;
        if (stakedRaw) {
            const events = stakedRaw.events;
            const token  = events[0].value.toString().toLowerCase();
            const currency = Helper.toCurrency(network, token);
            const requestedAmount = await this.helper.amountToHuman(currency, events[2].value.toString());
            const stakedAmount = await this.helper.amountToHuman(currency, events[3].value.toString());
            staked = {
                token: events[0].value.toString(),
                staker: events[1].value.toString(),
                requestedAmount,
                stakedAmount,
            } as StakedEvent;
        }
        if (paidOutRaw) {
            paidOut = await this.processPaidOutEvent(network, paidOutRaw);
        }
        return [staked, paidOut];
    }

    protected async processPaidOutEvent(network: string, paidOutRaw: any): Promise<PaidOutEvent> {
        const events = paidOutRaw.events;
        const token  = events[0].value.toString().toLowerCase();
        const currency = Helper.toCurrency(network, token);
        let rewardToken = token;
        let rewardCurrency = currency;
        let amountValue = events[2].value.toString();
        let rewardValue = events[3].value.toString();
        let staker = events[1].value.toString();
        if (events.length == 5) {
            // Separate reward token
            rewardToken = events[1].value.toString().toLowerCase();
            rewardCurrency = Helper.toCurrency(network, rewardToken);
            amountValue = events[3].value.toString();
            rewardValue = events[4].value.toString();
            staker = events[2];
        }
        const amount = await this.helper.amountToHuman(currency, amountValue);
        const reward = await this.helper.amountToHuman(rewardCurrency, rewardValue);
        return {
            token,
            rewardToken,
            symbol: await this.helper.symbol(currency),
            rewardSymbol: await this.helper.symbol(rewardCurrency),
            staker,
            amount,
            reward,
        } as PaidOutEvent;
    }
}