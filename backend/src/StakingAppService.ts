import { MongooseConnection } from "aws-lambda-helper";
import { Connection, Model, Document } from "mongoose";
import { Injectable, ValidationUtils, RetryableError, retry } from "ferrum-plumbing";
import { UnifyreExtensionKitClient, ClientModule } from "unifyre-extension-sdk";
import { StakingApp,UserStakingData } from "./Types";
import { StakingAppModel,UserStakingAppModel } from "./MongoTypes";
import { AppLinkRequest } from "unifyre-extension-sdk/dist/client/model/AppLink";
import { SmartContratClient } from "./SmartContractClient";
import {stake} from './Types';

export class StakingAppService extends MongooseConnection implements Injectable {
    private model: Model<StakingApp & Document, {}> | undefined;
    private userModel: Model<UserStakingData & Document, {}> | undefined;
    constructor(
        private uniClientFac: () => UnifyreExtensionKitClient,
        private contract: SmartContratClient,
    ) { super(); }

    initModels(con: Connection): void {
        this.model = StakingAppModel(con)
        this.userModel = UserStakingAppModel(con)
    }

    
    async saveStakeInfo(
        token: string,
        currency: string
    ): Promise<any> {
        let inst = await this.contract.instance(currency);
        let contractInstance = inst.methods;
        let tokenName = await contractInstance.tokenAddress().call();
        let tokenContract = await this.contract.contractInfo(currency);
        let stakedTotal = await contractInstance.stakedTotal().call();
        let stakingTotal = await contractInstance.stakingTotal().call();
        let withdrawStarts = await contractInstance.withdrawStarts().call();
        let withdrawEnds = await contractInstance.withdrawEnds().call();
        let stakingStarts = await contractInstance.stakingStarts().call();
        let stakingEnds = await contractInstance.stakingEnds().call();
        let response = await this.save(
            {
                tokenName,
                symbol: currency,
                stakedAmount: stakedTotal,
                stakingCap: stakingTotal,
                withdrawEnds,
                withdrawStarts,
                stakingEnds,
                stakingStarts,
                createdAt: Date.now(),
                creatorAddress: token,
                network: 'ETHEREUM',
                version: 0
            }
        )
        return response;
    }


    async stakeToken (args: stake) {
        const { amount,uniToken } = args;
        const client = this.uniClientFac();
        await client.signInWithToken(uniToken);
        const userProfile = client.getUserProfile();
        ValidationUtils.isTrue(!!userProfile, 'Error connecting to unifyre');
        let stakerAddress = (userProfile.accountGroups[0]?.addresses || [])[0]?.address;
        let network = (userProfile.accountGroups[0]?.addresses || [])[0]?.network;
        let currency = (userProfile.accountGroups[0]?.addresses || [])[0]?.currency;
        let symbol = (userProfile.accountGroups[0]?.addresses || [])[0]?.symbol;
        const txs = await this.contract.checkAllowanceAndStake(
            currency,
            symbol,
            stakerAddress,
            amount,
        );
        return await client.sendTransactionAsync(network, txs);
    };

    async unstakeToken (args: stake) {
        const { amount,uniToken } = args;
        const client = this.uniClientFac();
        await client.signInWithToken(uniToken);
        const userProfile = client.getUserProfile();
        ValidationUtils.isTrue(!!userProfile, 'Error connecting to unifyre');
        let stakerAddress = (userProfile.accountGroups[0]?.addresses || [])[0]?.address;
        let network = (userProfile.accountGroups[0]?.addresses || [])[0]?.network;
        let currency = (userProfile.accountGroups[0]?.addresses || [])[0]?.currency;
        let symbol = (userProfile.accountGroups[0]?.addresses || [])[0]?.symbol;
        const txs = await this.contract.checkAllowanceAndUnStake(
            currency,
            symbol,
            stakerAddress,
            amount,
        );
        return await client.sendTransactionAsync(network, txs);
    };

    async saveUserStakingData (address:string,userId:string,currency: string) {
        let userStakeData = await this.contract.userStake(address,currency);
        if(userStakeData){
           const response = await this.saveUserData(
               {
                   amountInStake: userStakeData.amount,
                   userId,
                   tokenId: currency,
                   createdAt: Date.now()
               }
           );
           console.log(response.toString())
           return response;
        }
        return;
    }

    private async saveUserData(pd: UserStakingData) { 
        this.verifyInit();
        return new this.userModel!(pd).save();
    }

    private async save(pd:StakingApp) { 
        this.verifyInit();
        return new this.model!(pd).save();
    }

    async get(symbol: string): Promise<any> {
        ValidationUtils.isTrue(!!symbol, '"symbol" must be provided');
        const pd = await this.model?.find({symbol}).exec();
        if (!pd) return;
        console.log(pd.toString())
        return pd;
    }
}