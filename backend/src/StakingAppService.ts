import { MongooseConnection } from "aws-lambda-helper";
import { Connection, Model, Document } from "mongoose";
import { Injectable, Network, ValidationUtils } from "ferrum-plumbing";
import { UnifyreExtensionKitClient } from "unifyre-extension-sdk";
import { StakingApp, UserStake } from "./Types";
import { StakingAppModel } from "./MongoTypes";
import { SmartContratClient } from "./SmartContractClient";
import { TimeoutError } from "unifyre-extension-sdk/dist/client/AsyncRequestRepeater";

const SIGNATURE_TIMEOUT = 1000 * 45;

async function undefinedOnTimeout<T>(fun: () => Promise<T|undefined>) {
    try {
        return await fun();
    } catch (e) {
        if (e instanceof TimeoutError) {
            return undefined
        }
    }
}

export class StakingAppService extends MongooseConnection implements Injectable {
    private stakingModel: Model<StakingApp & Document, {}> | undefined;
    // private userModel: Model<UserStake & Document, {}> | undefined; // TODO: Properly implement user stake management
    constructor(
        private uniClientFac: () => UnifyreExtensionKitClient,
        private contract: SmartContratClient,
    ) { super(); }

    initModels(con: Connection): void {
        this.stakingModel = StakingAppModel(con)
        // this.userModel = UserStakingAppModel(con)
    }
    
    async saveStakeInfo(network: string, contractAddress: string): Promise<StakingApp> {
        let response = await this.contract.contractInfo(network, contractAddress.toLowerCase());
        console.log('Got contract info to save', response); 
        ValidationUtils.isTrue(!!response && !!response.currency, 'Staking contract not found: ' + contractAddress)
        await this.saveStakingApp(response);
        return response;
    }

    async getStakingsForToken(currency: string): Promise<StakingApp[]> {
        const apps = await this.stakingModel?.find({currency}).exec() || [];
        return apps.map(a => a.toJSON());
    }

    async getStakingContractForUser(
        network: string, contractAddress: string, userAddress: string, userId: string): Promise<[UserStake, StakingApp]> {
        const stakingContract = await this.contract.contractInfo(network, contractAddress);
        ValidationUtils.isTrue(!!stakingContract && !!stakingContract.currency, 'Staking contract not found: ' + contractAddress)
        const currency = stakingContract.currency;
        const stakeOf = await this.contract.stakeOf(network, contractAddress, currency, userAddress);
        const userStake = {
            amountInStake: stakeOf,
            contractAddress,
            currency,
            network,
            userAddress,
            userId,
        } as UserStake;
        return [userStake, stakingContract]
    }

    async stakeTokenSignAndSend(
            network: Network, contractAddress: string, userAddress: string, amount: string): Promise<string> {
        const stakingContract = await this.contract.contractInfo(network, contractAddress);
        ValidationUtils.isTrue(!!stakingContract && !!stakingContract.currency, 'Staking contract not found: ' + contractAddress)
        const txs = await this.contract.checkAllowanceAndStake(
            stakingContract,
            userAddress,
            amount
        );
        const client = this.uniClientFac();
        const requestId = await client.sendTransactionAsync(network, txs);
        const response = await undefinedOnTimeout(() => client.getSendTransactionResponse(requestId, SIGNATURE_TIMEOUT));
        if (!!response) {
            // TODO: Process response and save transaction IDs
        }
        return requestId;
    };

    async unstakeTokenSignAndSend(
            network: Network, contractAddress: string, userAddress: string, amount: string): Promise<string> {
        const stakingContract = await this.contract.contractInfo(network, contractAddress);
        ValidationUtils.isTrue(!!stakingContract && !!stakingContract.currency, 'Staking contract not found: ' + contractAddress)
        const txs = await this.contract.unStake(
            stakingContract,
            userAddress,
            amount
        );
        const client = this.uniClientFac();
        const requestId = await client.sendTransactionAsync(network, txs);
        const response = await undefinedOnTimeout(() => client.getSendTransactionResponse(requestId, SIGNATURE_TIMEOUT));
        if (!!response) {
            // TODO: Process response and save transaction IDs
        }
        return requestId;
    };

    private async saveStakingApp(pd:StakingApp) { 
        this.verifyInit();
        return new this.stakingModel!(pd).save();
    }
}