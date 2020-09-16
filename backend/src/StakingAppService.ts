import { MongooseConnection } from "aws-lambda-helper";
import { Connection, Model, Document } from "mongoose";
import { Injectable, Network, ValidationUtils } from "ferrum-plumbing";
import { CustomTransactionCallRequest, UnifyreExtensionKitClient } from "unifyre-extension-sdk";
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
    
    async saveStakeInfo(network: string, contractAddress: string,
        groupId: string, color?: string, logo?: string, backgroundImage?: string,
        minContribution?: string): Promise<StakingApp> {
        let response = await this.contract.contractInfo(network, contractAddress.toLowerCase());
        console.log('Got contract info to save', response); 
        ValidationUtils.isTrue(!!response && !!response.currency, 'Staking contract not found: ' + contractAddress)
        return await this.saveStakingApp({...response,
            color, logo, backgroundImage, groupId, minContribution,
        });
    }

    async getStakingsForToken(currency: string): Promise<StakingApp[]> {
        this.verifyInit();
        const apps = await this.stakingModel!.find({currency}).exec() || [];
        return apps.map(a => a.toJSON());
    }

    async getStaking(contractAddress: string): Promise<StakingApp|undefined> {
        this.verifyInit();
        const apps = await this.stakingModel!.findOne({contractAddress}).exec();
        return apps?.toJSON();
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

    async getUserStakingEvents(userId: string, currency: string):
        Promise<StakeEvent[]> {
        // Get all user stakeEvents
        const stakeEvents = await this.userStakeEvents(userId, currency);
        return stakeEvents;
    }

    async updateStakingEvents(
        txIds: string[],
    ): Promise<StakeEvent[]> {
        const updatesF = txIds.map(txId => this.updateUserStake(txId));
        const updates = await Promise.all(updatesF);
        return updates.filter(Boolean).map(s => s!);
    }

    async stakeTokenSignAndSendGetTransactions(
            token: string,
            network: Network, contractAddress: string, userAddress: string, amount: string):
            Promise<CustomTransactionCallRequest[]> {
        const stakingContract = await this.contract.contractInfo(network, contractAddress);
        ValidationUtils.isTrue(!!stakingContract && !!stakingContract.currency, 'Staking contract not found: ' + contractAddress)
        return await this.contract.checkAllowanceAndStake(
            stakingContract,
            userAddress,
            amount
        );
    }

    async stakeTokenSignAndSend(
            token: string,
            network: Network, contractAddress: string, userAddress: string, amount: string):
            Promise<{ requestId: string, stakeEvent?: StakeEvent }> {
        const txs = await this.stakeTokenSignAndSendGetTransactions(token, network,
            contractAddress, userAddress, amount);
        const client = this.uniClientFac();
        await client.signInWithToken(token);
        const payload = { network, userAddress, amount, contractAddress, action: 'stake' };
        const requestId = await client.sendTransactionAsync(network, txs, payload);
        // Disabling the response for Lambda. AWS API kill the connection after a few seconds
        // const response = await undefinedOnTimeout(() => client.getSendTransactionResponse(requestId, SIGNATURE_TIMEOUT));
        // if (!!response) {
        //     ValidationUtils.isTrue(!response!.rejected, 'Request rejected: ' + response!.reason || '');
        //     const txIds = response!.response.map(r => r.transactionId);
        //     ValidationUtils.isTrue(!!txIds.length, 'No transaction was returned from Unifyre');
        //     const mainTxId = txIds[txIds.length - 1];
        //     txIds.pop();
        //     const userProfile = client.getUserProfile();
        //     const stakeEvent = await this.processTransaction(
        //         'stake', mainTxId, txIds, stakingContract, userAddress,
        //         amount, userProfile.userId, userProfile.email || '');
        //     return {requestId, stakeEvent};
        // }
        return {requestId};
    };

    async stakeEventProcessTransactions(token: string,
        eventType: 'stake'|'unstake', contractAddress: string, amount: string, txIds: string[], ) {
        const client = this.uniClientFac();
        await client.signInWithToken(token);
        const userProfile = await client.getUserProfile();
        const addr = userProfile.accountGroups[0]?.addresses[0];
        ValidationUtils.isTrue(!!txIds && !!txIds.length, 'txids must be provided');
        ValidationUtils.isTrue(!!addr, 'Error accessing unifyre. Cannot access user address');
        const stakingContract = (await this.getStaking(contractAddress))!;
        const mainTxId = txIds.pop()!;
        return await this.processTransaction(
            eventType,
            mainTxId,
            txIds,
            stakingContract,
            addr.address,
            amount,
            userProfile.userId,
            userProfile.email || '',
        )
    }

    private async processTransaction(
        eventType: 'stake' | 'unstake',
        mainTxId: string,
        allocationTxIds: string[],
        stakingContract: StakingApp,
        userAddress: string,
        amount: string,
        userId: string,
        email: string,
        ) {
        return await this.registerOrUpdateUserStake(
            eventType,
            mainTxId,
            allocationTxIds,
            stakingContract,
            userAddress,
            userId,
            email || '',
            amount, 
        );
    }

    async unstakeTokenSignAndSendGetTransaction(
            network: Network, contractAddress: string, userAddress: string, amount: string):
            Promise<CustomTransactionCallRequest[]> {
        const stakingContract = await this.contract.contractInfo(network, contractAddress);
        ValidationUtils.isTrue(!!stakingContract && !!stakingContract.currency, 'Staking contract not found: ' + contractAddress)
        return this.contract.unStake(
            stakingContract,
            userAddress,
            amount
        );
    }

    async unstakeTokenSignAndSend(
            network: Network, contractAddress: string, userAddress: string, amount: string):
            Promise<{requestId: string}> {
        const txs = await this.unstakeTokenSignAndSendGetTransaction(
            network, contractAddress, userAddress, amount,
        );
        const payload = { network, userAddress, amount, contractAddress, action: 'unstake' };
        const client = this.uniClientFac();
        const requestId = await client.sendTransactionAsync(network, txs, payload);
        // const response = await undefinedOnTimeout(() =>
        //     client.getSendTransactionResponse(requestId, SIGNATURE_TIMEOUT));
        // if (!!response && !response.rejected) {
        //     const userProfile = await client.getUserProfile();
        //     const txIds = response!.response.map(r => r.transactionId);
        //     ValidationUtils.isTrue(!!txIds.length, 'No transaction was returned from Unifyre');
        //     const mainTxId = txIds[txIds.length - 1];
        //     txIds.pop();
        //     await this.registerOrUpdateUserStake(
        //         'unstake',
        //         mainTxId,
        //         txIds,
        //         stakingContract,
        //         userAddress,
        //         userProfile.userId,
        //         userProfile.email || '',
        //         amount, 
        //     );
        // }
        return {requestId};
    };

    private async updateUserStake(
        mainTxId: string,
    ): Promise<StakeEvent|undefined> {
        const userStake = await this.getUserStakeEvent(mainTxId);
        if (!userStake) {
            return undefined;
        }
        const [network, _] = EthereumSmartContractHelper.parseCurrency(userStake!.currency);
        const status = await this.contract.helper.getTransactionStatus(
            network, mainTxId, userStake!.createdAt);
        if (status !== userStake.transactionStatus) {
            let upUserStake = {
                ...userStake,
                transactionStatus: status,
            } as StakeEvent;
            upUserStake = await this.updateStakeEventWithLogs(upUserStake);
            await this.updateStakeEvent(upUserStake);
            return await this.getUserStakeEvent(mainTxId);
        }
    }

    private async registerOrUpdateUserStake(
        eventType: 'stake' | 'unstake',
        mainTxId: string,
        approveTxIds: string[],
        contrat: StakingApp,
        userAddress: string,
        userId: string,
        email: string,
        amountStaked: string,
        ) {
        const [network, _] = EthereumSmartContractHelper.parseCurrency(contrat.currency);
        const userStake = await this.getUserStakeEvent(mainTxId);
        const status = await this.contract.helper.getTransactionStatus(
            network, mainTxId, userStake?.createdAt || 0);
        if (!!userStake && userStake!.transactionStatus !== status) {
            let upUserStake = {
                ...userStake,
                transactionStatus: status,
            } as StakeEvent;
            upUserStake = await this.updateStakeEventWithLogs(upUserStake);
            return this.updateStakeEvent(upUserStake);
        } else {
            let stakeEvent = {
                createdAt: Date.now(),
                type: eventType,
                version: 0,
                network: network,
                contractAddress: contrat.contractAddress,
                contractName: contrat.name,
                currency: contrat.currency,
                symbol: contrat.symbol,
                mainTxId,
                approveTxIds,
                userAddress,
                userId,
                email,
                amountStaked,
                transactionStatus: status,
            } as StakeEvent;
            stakeEvent = await this.updateStakeEventWithLogs(stakeEvent)
            return this.saveNewStakeEvent(stakeEvent);
        }
    }

    private async updateStakeEvent(stakeEvent: StakeEvent) {
        this.verifyInit();
        const newPd = {...stakeEvent};
        const version = stakeEvent.version;
        newPd.version = version + 1;
        const updated = await this.stakeEventModel!.findOneAndUpdate({
            "$and": [{ mainTxId: stakeEvent.mainTxId }, { version }] },
        { '$set': { ...newPd } }).exec();
        ValidationUtils.isTrue(!!updated, 'Error updating StakeEvent. Update returned empty. Retry');
        return updated?.toJSON();
    }

    private async updateStakeEventWithLogs(stakeEvent: StakeEvent): Promise<StakeEvent> {
        if (stakeEvent.transactionStatus !== 'successful') { return stakeEvent; }
        const upEvent = {...stakeEvent};
        const [staked, paidOut] = await this.contract.transactionLog(stakeEvent.network, stakeEvent.mainTxId);
        if (staked) {
            upEvent.amountStaked = staked.stakedAmount;
        }
        if (paidOut) {
            upEvent.amountUnstaked = paidOut.amount;
            upEvent.amountOfReward = paidOut.reward;
        }
        return upEvent;
    }

    private async saveNewStakeEvent(se: StakeEvent) {
        const newSw = {...se};
        const saved = await new this.stakeEventModel!(newSw).save();
        ValidationUtils.isTrue(!!saved, 'Error saving StakeEvent. Sve returned empty. Retry');
        return saved?.toJSON();
    }

    private async getUserStakeEvent(mainTxId: string): Promise<StakeEvent | undefined> {
        this.verifyInit();
        const stakes = await this.stakeEventModel!.findOne({mainTxId}).exec();
        return stakes?.toJSON();
    }

    private async userStakesForContracts(userId: string, contractAddress: string) {
        this.verifyInit();
        const stakes = await this.stakeEventModel!.find({userId, contractAddress}).exec();
        return stakes.map(s => s.toJSON());
    }

    private async userStakeEvents(userId: string, currency: string) {
        this.verifyInit();
        const stakes = await this.stakeEventModel!.find({'$and': [{userId}, {currency}]}).exec();
        return stakes.map(s => s.toJSON());
    }

    private async saveStakingApp(pd:StakingApp) { 
        this.verifyInit();
        return new this.stakingModel!(pd).save();
    }
}