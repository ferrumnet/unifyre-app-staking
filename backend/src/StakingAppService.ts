import { MongooseConnection } from "aws-lambda-helper";
import { Connection, Model, Document } from "mongoose";
import { Injectable, Network, ValidationUtils } from "ferrum-plumbing";
import { UnifyreExtensionKitClient } from "unifyre-extension-sdk";
import { StakeEvent, StakingApp, UserStake } from "./Types";
import { StakeEventModel, StakingAppModel } from "./MongoTypes";
import { SmartContratClient } from "./SmartContractClient";
import { TimeoutError } from "unifyre-extension-sdk/dist/client/AsyncRequestRepeater";
import { EthereumSmartContractHelper } from "aws-lambda-helper/dist/blockchain";

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
    private stakeEventModel: Model<StakeEvent & Document, {}> | undefined;
    constructor(
        private uniClientFac: () => UnifyreExtensionKitClient,
        private contract: SmartContratClient,
    ) { super(); }

    initModels(con: Connection): void {
        this.stakingModel = StakingAppModel(con)
        this.stakeEventModel = StakeEventModel(con)
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
        network: string, contractAddress: string, userAddress: string, userId: string):
        Promise<[UserStake, StakingApp, StakeEvent[]]> {
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
        // Get all user stakes
        const stakeEvents = await this.userStakesForContracts(userId, contractAddress);
        return [userStake, stakingContract, stakeEvents];
    }

    async updateStakingEvents(
        txIds: string[],
    ): Promise<StakeEvent[]> {
        const updatesF = txIds.map(txId => this.updateUserStake(txId));
        const updates = await Promise.all(updatesF);
        return updates.filter(Boolean).map(s => s!);
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
        const response = await undefinedOnTimeout(() =>
            client.getSendTransactionResponse(requestId, SIGNATURE_TIMEOUT));
        if (!!response && !response.rejected) {
            const userProfile = client.getUserProfile();
            const txIds = response!.response.map(r => r.transactionId);
            ValidationUtils.isTrue(!!txIds.length, 'No transaction was returned from Unifyre');
            const stakeTxId = txIds[txIds.length - 1];
            txIds.pop();
            await this.registerOrUpdateUserStake(
                stakeTxId,
                txIds,
                stakingContract,
                userAddress,
                userProfile.userId,
                userProfile.email || '',
                amount, 
            );
        }
        return requestId;
    };

    private async updateUserStake(
        stakeTxId: string,
    ): Promise<StakeEvent|undefined> {
        const userStake = await this.getUserStakeEvent(stakeTxId);
        if (!userStake) {
            return undefined;
        }
        const [network, _] = EthereumSmartContractHelper.parseCurrency(userStake!.currency);
        const status = await this.contract.helper.getTransactionStatus(
            network, stakeTxId, userStake!.createdAt);
        if (status !== userStake.transactionStatus) {
            const upUserStake = {
                ...userStake,
                transactionStatus: status,
            } as StakeEvent;
            await this.updateStakeEvent(upUserStake);
            return await this.getUserStakeEvent(stakeTxId);
        }
    }

    private async registerOrUpdateUserStake(
        stakeTxId: string,
        approveTxIds: string[],
        contrat: StakingApp,
        userAddress: string,
        userId: string,
        email: string,
        amountStaked: string,
        ) {
        const [network, _] = EthereumSmartContractHelper.parseCurrency(contrat.currency);
        const userStake = await this.getUserStakeEvent(stakeTxId);
        const status = await this.contract.helper.getTransactionStatus(
            network, stakeTxId, userStake?.createdAt || 0);
        if (!!userStake && userStake!.transactionStatus !== status) {
            const upUserStake = {
                ...userStake,
                transactionStatus: status,
            } as StakeEvent;
            return this.updateStakeEvent(upUserStake);
        } else {
            const stakeEvent = {
                version: 0,
                contractAddress: contrat.contractAddress,
                contractName: contrat.name,
                currency: contrat.currency,
                symbol: contrat.symbol,
                stakeTxId,
                approveTxIds,
                userAddress,
                userId,
                email,
                amountStaked,
                transactionStatus: status,
            } as StakeEvent;
            return this.saveNewStakeEvent(stakeEvent);
        }
    }

    private async updateStakeEvent(stakeEvent: StakeEvent) {
        this.verifyInit();
        const newPd = {...stakeEvent};
        const version = stakeEvent.version;
        newPd.version = version + 1;
        const updated = await this.stakeEventModel!.findOneAndUpdate({
            "$and": [{ stakeTxId: stakeEvent.stakeTxId }, { version }] },
        { '$set': { ...newPd } }).exec();
        ValidationUtils.isTrue(!!updated, 'Error updating StakeEvent. Update returned empty. Retry');
        return updated?.toJSON();
    }

    private async saveNewStakeEvent(se: StakeEvent) {
        const newSw = {...se};
        const saved = await new this.stakeEventModel!(newSw).save();
        ValidationUtils.isTrue(!!saved, 'Error saving StakeEvent. Sve returned empty. Retry');
        return saved?.toJSON();
    }

    private async getUserStakeEvent(stakeTxId: string): Promise<StakeEvent | undefined> {
        this.verifyInit();
        const stakes = await this.stakeEventModel!.findOne({stakeTxId}).exec();
        return stakes?.toJSON();
    }

    private async userStakesForContracts(userId: string, contractAddress: string) {
        this.verifyInit();
        const stakes = await this.stakeEventModel!.find({userId, contractAddress}).exec();
        return stakes.map(s => s.toJSON());
    }

    private async userStakes(userId: string) {
        this.verifyInit();
        const stakes = await this.stakeEventModel!.find({userId}).exec();
        return stakes.map(s => s.toJSON());
    }

    private async saveStakingApp(pd:StakingApp) { 
        this.verifyInit();
        return new this.stakingModel!(pd).save();
    }
}