import { MongooseConnection } from "aws-lambda-helper";
import { Connection, Model, Document } from "mongoose";
import { Injectable, LocalCache, Network, ValidationUtils } from "ferrum-plumbing";
import { CustomTransactionCallRequest, UnifyreExtensionKitClient } from "unifyre-extension-sdk";
import { GroupInfo, StakeEvent, StakingApp, StakingContractType, UserStake } from "./Types";
import { GroupInfoModel, StakeEventModel, StakingAppModel } from "./MongoTypes";
import { SmartContratClient } from "./SmartContractClient";
import { TimeoutError } from "unifyre-extension-sdk/dist/client/AsyncRequestRepeater";
import { EthereumSmartContractHelper } from "aws-lambda-helper/dist/blockchain";
import { Big } from 'big.js';

const SIGNATURE_TIMEOUT = 1000 * 45;
const PUBLIC_STAKING_INFO_CACHE_TIMEOUT = 1000 * 60;

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
    private groupInfoModel: Model<GroupInfo & Document, {}> | undefined;
    private cache = new LocalCache();
    constructor(
        private uniClientFac: () => UnifyreExtensionKitClient,
        private stakingContract: SmartContratClient,
        private stakeFarmingContract: SmartContratClient,
    ) { super(); }

    initModels(con: Connection): void {
        console.log('DB WAS ',con.db );
        this.stakingModel = StakingAppModel(con);
        this.stakeEventModel = StakeEventModel(con);
        this.groupInfoModel = GroupInfoModel(con);
    }

    private contract(cType: StakingContractType) {
        return cType === 'stakeFarming' ? this.stakeFarmingContract : this.stakingContract;
    }
    
    async saveStakeInfo(network: string,
        contractType: StakingContractType,
        contractAddress: string,
        groupId: string, color?: string, logo?: string, backgroundImage?: string,
        minContribution?: string,
        maxContribution?: string,
        emailWhitelist?: string,
        earlyWithdrawRewardSentence?: string,
        totalRewardSentence?: string,
        ): Promise<StakingApp> {
        let response = await this.contract(contractType).contractInfo(network, contractAddress.toLowerCase());
        console.log('Got contract info to save', response); 
        ValidationUtils.isTrue(!!response && !!response.currency, 'Staking contract not found: ' + contractAddress)
        return await this.saveStakingApp({...response,
            contractType,
            color, logo, backgroundImage, groupId, minContribution,
            maxContribution, emailWhitelist,
            earlyWithdrawRewardSentence, totalRewardSentence,
        });
    }

    async updateStakeInfo(data: StakingApp): Promise<StakingApp> {
        ValidationUtils.isTrue(!!data.contractAddress, 'contractAddress is required')
        //@ts-ignore
        return await this.adminUpdateStakingInfo({...data});
    }

    async getStakingByContractAddress(network: string,
            contractAddress: string): Promise<StakingApp|undefined> {
        this.verifyInit();
        return this.cache.getAsync(`PUBLIC_STAKE.${network}.${contractAddress}`, async () => {
            const cot = await this.getStaking(network, contractAddress);
            if (!cot) { return undefined; }
            const fromCont = await this.contract(cot!.contractType).contractInfo(
                cot!.network, contractAddress);
            return {...fromCont, ...cot};
        }, PUBLIC_STAKING_INFO_CACHE_TIMEOUT);
    }

    async getStakingsForToken(currency: string): Promise<StakingApp[]> {
        this.verifyInit();
        const apps = await this.stakingModel!.find({currency}).exec() || [];
        return apps.map(a => a.toJSON());
    }

    async getStaking(network: string, contractAddress: string): Promise<StakingApp|undefined> {
        this.verifyInit();
        const apps = await this.stakingModel!.find({contractAddress}).exec() || [];
        const allStakes = apps.map(a => a.toJSON());
        if (allStakes.length === 1 && !network) {
            return allStakes[0];
        }
        return allStakes.length > 0 ? allStakes.filter(s => s.network === network)[0] :
            undefined;
    }

    async getStakingContractForUser(
        network: string, contractAddress: string, userAddress: string, userId: string):
        Promise<[UserStake, StakingApp, StakeEvent[]]> {
        let stakingContract = await this.getStaking(network, contractAddress);
        ValidationUtils.isTrue(!!stakingContract, 'Contract not registerd');
        ValidationUtils.isTrue(!!(stakingContract?.network ===  network), `You are Connected to the wrong Network for this Contract. Kindly Connect to ${stakingContract?.network}`);
        const fromCont = await this.contract(stakingContract!.contractType).contractInfo(
            stakingContract!.network, contractAddress);
        stakingContract = {...stakingContract, ...fromCont,
            name: stakingContract!.name};
        const currency = stakingContract!.currency;
        const stakeOf = await this.contract(stakingContract!.contractType).stakeOf(network, contractAddress, currency, userAddress);
        const userStake = {
            amountInStake: stakeOf,
            contractAddress,
            currency,
            network,
            userAddress,
            userId,
        } as UserStake;
        if (stakingContract.rewardContinuationAddress) {
            const contCur = stakingContract.rewardContinuationCurrency ||
                    stakingContract.rewardCurrency ||
                        stakingContract.currency;
            const continuationRewards = await this.contract(stakingContract!.contractType)
                .continuationRewardsOf(network, stakingContract.rewardContinuationAddress!,
                contCur,
                userAddress);
            userStake.continuationRewards = continuationRewards;
            stakingContract.rewardContinuationSymbol = await this.contract(
                stakingContract!.contractType).helper.symbol(contCur);
        }
        // Get all user stakes
        const stakeEvents = await this.userStakesForContracts(userId, contractAddress);
        return [userStake, stakingContract!, stakeEvents];
    }

    async getUserStakingEvents(userId: string, currency: string):
        Promise<StakeEvent[]> {
        // Get all user stakeEvents
        const stakeEvents = await this.userStakeEvents(userId, currency);
        return stakeEvents;
    }

    async getGroupInfo(groupId: string): Promise<GroupInfo|undefined> {
        this.verifyInit();
        ValidationUtils.isTrue(!!groupId, '"groupId" must be provided');
        const r = await this.groupInfoModel!.findOne({groupId}).exec();
        if (r) {
            return r.toJSON();
        }
        return;
    }

    async addGroupInfo(info: GroupInfo): Promise<GroupInfo|undefined> {
        this.verifyInit();
        ValidationUtils.isTrue(!!info.groupId, '"groupId" must be provided');
        ValidationUtils.isTrue(!!info.homepage, '"homepage" must be provided');
        ValidationUtils.isTrue(!!info.themeVariables, '"themeVariables" must be provided');
        ValidationUtils.isTrue(!!info.defaultCurrency, '"defaultCurrency" must be provided');
        const r = await new this.groupInfoModel!({...info}).save();
        if (r) {
            return r;
        }
        return;
    }

    async updateGroupInfo(info: GroupInfo): Promise<GroupInfo|undefined> {
        this.verifyInit();
        ValidationUtils.isTrue(!!info.groupId, '"groupId" must be provided');
        ValidationUtils.isTrue(!!info.homepage, '"homepage" must be provided');
        ValidationUtils.isTrue(!!info.themeVariables, '"themeVariables" must be provided');
        ValidationUtils.isTrue(!!info.defaultCurrency, '"defaultCurrency" must be provided');
        const r = await this.updateGroupInfoItem(info);
        if (r) {
            return r;
        }
        return;
    }

    async getAllGroupInfo(): Promise<GroupInfo[]|undefined> {
        this.verifyInit();
        const r = await this.groupInfoModel!.find({}).sort({'groupId':'asc'}).exec();
        if (r) {
            return r;
        }
        return;
    }

    async updateStakingEvents(
        txIds: string[],
    ): Promise<StakeEvent[]> {
        const updatesF = txIds.map(txId => this.updateUserStake(txId));
        const updates = await Promise.all(updatesF);
        return updates.filter(Boolean).map(s => s!);
    }

    async stakeTokenSignAndSendGetTransactions(
            userId: string,
            email: string,
            network: string,
            contractAddress: string, userAddress: string, amount: string):
            Promise<CustomTransactionCallRequest[]> {
        const stakingContract = (await this.getStaking(network, contractAddress))!;
        ValidationUtils.isTrue(!!stakingContract && !!stakingContract.currency, 'Staking contract not found: ' + contractAddress)
        if (stakingContract.maxContribution) {
            ValidationUtils.isTrue(new Big(stakingContract.maxContribution).gte(new Big(amount)),
                `Maximum contribution is ${stakingContract.maxContribution}`);
            const allStakes = await this.getUserStakingEvents(userId, stakingContract.currency);
            const sumStakes = allStakes.filter(s => s.contractAddress === contractAddress)
                .reduce((prev, cur) => prev.add(cur.amountStaked || '0'), new Big('0'));
            ValidationUtils.isTrue(new Big(stakingContract.maxContribution).gte(new Big(sumStakes)),
                `Maximum contribution is ${stakingContract.maxContribution}. You have already staked ${sumStakes.toFixed()}`);
        }
        if (stakingContract.emailWhitelist) {
            const emails = stakingContract.emailWhitelist!.split(',').map(e => e.trim().toLocaleLowerCase());
            ValidationUtils.isTrue(emails.indexOf(email.toLocaleLowerCase())>=0,
                'Your email is not whitelisted');
        }
        if (stakingContract.addressWhitelist) {
            const addresses = stakingContract.addressWhitelist!.split(',')
                .map(e => e.trim().toLocaleLowerCase()).filter(a => !!a);
            ValidationUtils.isTrue(
                addresses.indexOf(userAddress.toLocaleLowerCase())>=0 ||
                    addresses.indexOf(userId.toLocaleLowerCase())>=0,
                'Your address is not whitelisted');
        }
        return await this.contract(stakingContract.contractType).checkAllowanceAndStake(
            stakingContract,
            userAddress,
            amount
        );
    }

    async stakeTokenSignAndSend(
            token: string,
            network: Network, contractAddress: string, userAddress: string, amount: string):
            Promise<{ requestId: string, stakeEvent?: StakeEvent }> {
        // Validate
        const client = this.uniClientFac();
        await client.signInWithToken(token);
        const user = await client.getUserProfile();
        const txs = await this.stakeTokenSignAndSendGetTransactions(user.userId, 
            user.email || '',
            network, contractAddress, userAddress, amount);
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

    async stakeEventProcessTransactions(userId: string, token: string,
        eventType: 'stake'|'unstake', network: string,
            contractAddress: string, amount: string, txIds: string[], ) {
        const client = this.uniClientFac();
        let email: string = '';
        let address: string = userId;
        if (token) {
            await client.signInWithToken(token);
            const userProfile = await client.getUserProfile();
            email = userProfile.email || '';
            const addr = userProfile.accountGroups[0]?.addresses[0];
            ValidationUtils.isTrue(!!txIds && !!txIds.length, 'txids must be provided');
            ValidationUtils.isTrue(!!addr, 'Error accessing unifyre. Cannot access user address');
            address = addr.address;
        }
        const stakingContract = (await this.getStaking(network, contractAddress))!;
        const mainTxId = txIds.pop()!;
        return await this.processTransaction(
            eventType,
            mainTxId,
            txIds,
            stakingContract,
            address,
            amount,
            userId,
            email,
        )
    }

    private async processTransaction(
        eventType: 'stake' | 'unstake',
        mainTxId: string,
        otherTxIds: string[],
        stakingContract: StakingApp,
        userAddress: string,
        amount: string,
        userId: string,
        email: string,
        ) {
        return await this.registerOrUpdateUserStake(
            eventType,
            mainTxId,
            otherTxIds,
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
        const stakingContract = (await this.getStaking(network, contractAddress))!
        ValidationUtils.isTrue(!!stakingContract && !!stakingContract.currency, 'Staking contract not found: ' + contractAddress)
        return this.contract(stakingContract.contractType).unStake(
            stakingContract,
            userAddress,
            amount
        );
    }

    async unstakeTokenSignAndSend(
            token: string,
            network: Network, contractAddress: string, userAddress: string, amount: string):
            Promise<{requestId: string}> {
        const txs = await this.unstakeTokenSignAndSendGetTransaction(
            network, contractAddress, userAddress, amount,
        );
        const payload = { network, userAddress, amount, contractAddress, action: 'unstake' };
        const client = this.uniClientFac();
        await client.signInWithToken(token);
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

    async takeRewardsSignAndSend(
            token: string,
            network: Network, contractAddress: string, userAddress: string):
            Promise<{requestId: string}> {
        const txs = await this.takeRewardsSignAndSendGetTransaction(
            network, contractAddress, userAddress,
        );
        const payload = { network, userAddress, amount: '0', contractAddress, action: 'unstake' };
        const client = this.uniClientFac();
        await client.signInWithToken(token);
        const requestId = await client.sendTransactionAsync(network, txs, payload);
        return {requestId};
    };

    async takeRewardsSignAndSendGetTransaction(
            network: Network, contractAddress: string, userAddress: string):
            Promise<CustomTransactionCallRequest[]> {
        const stakingContract = (await this.getStaking(network, contractAddress))!
        ValidationUtils.isTrue(!!stakingContract && !!stakingContract.currency, 'Staking contract not found: ' + contractAddress)
        return this.contract(stakingContract.contractType).takeRewards(
            stakingContract,
            userAddress,
        );
    }

    private async updateUserStake(
        mainTxId: string,
    ): Promise<StakeEvent|undefined> {
        const userStake = await this.getUserStakeEvent(mainTxId);
        if (!userStake) {
            return undefined;
        }
        const [network, _] = EthereumSmartContractHelper.parseCurrency(userStake!.currency);
        const status = await this.contract('staking').helper.getTransactionStatus(
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
        otherTxIds: string[],
        contract: StakingApp,
        userAddress: string,
        userId: string,
        email: string,
        amountStaked: string,
        ) {
        const [network, _] = EthereumSmartContractHelper.parseCurrency(contract.currency);
        const userStake = await this.getUserStakeEvent(mainTxId);
        const status = await this.contract(contract.contractType).helper.getTransactionStatus(
            network, mainTxId, userStake?.createdAt || 0);
        if (!!userStake) {
            if (userStake!.transactionStatus !== status) {
                let upUserStake = {
                    ...userStake,
                    transactionStatus: status,
                } as StakeEvent;
                upUserStake = await this.updateStakeEventWithLogs(upUserStake);
                return this.updateStakeEvent(upUserStake);
            }
            return userStake;
        } else {
            let stakeEvent = {
                contractType: contract.contractType || 'staking',
                createdAt: Date.now(),
                type: eventType,
                version: 0,
                network: network,
                contractAddress: contract.contractAddress,
                contractName: contract.name,
                currency: contract.currency,
                symbol: contract.symbol,
                rewardCurrency: contract.rewardCurrency,
                rewardSymbol: contract.rewardSymbol,
                mainTxId,
                approveTxIds: otherTxIds,
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
        console.log('UPDATING EVENT ', updated, stakeEvent.mainTxId, version);
        ValidationUtils.isTrue(!!updated, 'Error updating StakeEvent. Update returned empty. Retry');
        return updated?.toJSON();
    }

    private async adminUpdateStakingInfo(stake : StakingApp) {
        this.verifyInit();
        const st = {...stake};
        const version = stake._v;
        st._v = (version || 0) + 1;
        stake.contractAddress = stake.contractAddress.toLowerCase();
        const updated = await this.stakingModel!.findOneAndUpdate(
            {'$and': [{ network: stake.network }, { contractAddress: stake.contractAddress }]},
            { '$set': { ...st } }).exec();
        console.log('UPDATING STAKE INFO ', updated, st._id, version);
        ValidationUtils.isTrue(!!updated, 'Error updating Stake Info. Update returned empty. Retry');
        return updated?.toJSON();
    }

    async adminDeleteStakingInfo(network: string, contractAddress: string) {
        this.verifyInit();
        contractAddress = contractAddress.toLowerCase();
        const deleted = await this.stakingModel!.findOneAndDelete(
            {'$and': [{ 'network': network as any }, { contractAddress }]});
        console.log('DELETED STAKE INFO ', deleted, network, contractAddress);
        ValidationUtils.isTrue(!!deleted, 'Error deleting Stake Info. Update returned empty. Retry');
        return deleted?.toJSON();
    }

    private async updateGroupInfoItem(info: GroupInfo) {
        this.verifyInit();
        const newPd = {...info};
        const updated = await this.groupInfoModel!.findOneAndUpdate({
            "$and": [{ _id: info._id } ] },
        { '$set': { ...newPd } }).exec();
        console.log('UPDATING EVENT ', updated, info.groupId);
        ValidationUtils.isTrue(!!updated, 'Error updating GroupInfo. Update returned empty. Retry');
        return updated?.toJSON();
    }

    private async updateStakeEventWithLogs(stakeEvent: StakeEvent): Promise<StakeEvent> {
        if (stakeEvent.transactionStatus !== 'successful') { return stakeEvent; }
        const upEvent = {...stakeEvent};
        const [staked, paidOut] = await this.contract(stakeEvent.contractType)
            .transactionLog(stakeEvent.network, stakeEvent.mainTxId);
        console.log('updateStakeEventWithLogs transaction log is: ', {staked, paidOut});
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
        pd.contractAddress = pd.contractAddress.toLowerCase();
        this.verifyInit();
        return new this.stakingModel!(pd).save();
    }
}