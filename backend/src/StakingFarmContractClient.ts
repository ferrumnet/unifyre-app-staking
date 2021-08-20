import { PaidOutEvent, SmartContratClient, tryEither } from "./SmartContractClient";
import stakingFarmAbi from './resources/FestakingFarm-abi.json';
import Big from 'big.js';
import { EthereumSmartContractHelper } from "aws-lambda-helper/dist/blockchain";
import { StakingApp } from "./Types";
const Helper = EthereumSmartContractHelper;

export class StakingFarmContractClient extends SmartContratClient {
    constructor(
        helper: EthereumSmartContractHelper,
    ) {
        super(helper, stakingFarmAbi.abi);
    }

    protected stakingApp(network: string, contractAddress: string) {
        const web3 = this.helper.web3(network);
        return new web3.Contract(stakingFarmAbi.abi as any, contractAddress);
    }

    __name__() { return 'StakingFarmContractClient'; }

    protected async populateFurtherContractInfo(inst: any, result: StakingApp): Promise<StakingApp> {
        const contractInstance = inst.methods;
        const network = result.network;
        const rewardTokenAddress = (await contractInstance.rewardTokenAddress().call()).toString().toLowerCase();
        const rewardCurrency = Helper.toCurrency(network, rewardTokenAddress);
        const rewardBalanceRaw = (await contractInstance.rewardBalance().call()).toString();
        const [totalRewardRaw, hasTotalReward] = await tryEither(
                async () => await contractInstance.totalReward().call(),
                async () => await contractInstance.rewardsTotal().call(),
            );
        const earlyWithdrawRewardRaw = (await contractInstance.earlyWithdrawReward().call()).toString();
        return {
            ...result,
            rewardTokenAddress,
            rewardCurrency,
            rewardBalance: await this.helper.amountToHuman(rewardCurrency, rewardBalanceRaw),
            totalReward: await this.helper.amountToHuman(rewardCurrency, totalRewardRaw.toString()),
            rewardSymbol: await this.helper.symbol(rewardCurrency),
            earlyWithdrawReward: await this.helper.amountToHuman(rewardCurrency, earlyWithdrawRewardRaw),
            isLegacy: hasTotalReward,
        };
    }

    protected async processPaidOutEvent(network: string, paidOutRaw: any): Promise<PaidOutEvent> {
        const events = paidOutRaw.events;
        const token  = events[0].value.toString().toLowerCase();
        const rewardToken  = events[1].value.toString().toLowerCase();
        const currency = Helper.toCurrency(network, token);
        const rewardCurrency = Helper.toCurrency(network, rewardToken);
        const amount = await this.helper.amountToHuman(currency, events[3].value.toString());
        const reward = await this.helper.amountToHuman(rewardCurrency, events[4].value.toString());
        return {
            token,
            symbol: await this.helper.symbol(currency),
            rewardToken,
            rewardSymbol: await this.helper.symbol(rewardCurrency),
            staker: events[2].value.toString(),
            amount,
            reward,
        } as PaidOutEvent;
    }
}