import { MongooseConnection } from "aws-lambda-helper";
import { Connection, Model, Document } from "mongoose";
import { Injectable, ValidationUtils, RetryableError, retry } from "ferrum-plumbing";
import { UnifyreExtensionKitClient, ClientModule } from "unifyre-extension-sdk";
import { StakingApp } from "./Types";
import { StakingAppModel } from "./MongoTypes";
import { AppLinkRequest } from "unifyre-extension-sdk/dist/client/model/AppLink";
import { SmartContratClient } from "./SmartContractClient";
import {stake} from './Types';

export class StakingAppService extends MongooseConnection implements Injectable {
    private model: Model<StakingApp & Document, {}> | undefined;
    constructor(
        private uniClientFac: () => UnifyreExtensionKitClient,
        private contract: SmartContratClient,
    ) { super(); }

    initModels(con: Connection): void {
        this.model = StakingAppModel(con)
    }

    
    async saveStakeInfo(
        token: string,
        currency: string
    ): Promise<any> {
        let inst = await this.contract.instance(currency);
        let contractInstance = inst.methods;
        let tokenName = await contractInstance.tokenAddress().call();
        // const address = '0x0c42cEe7BA62B7969a755E0dC151521c6C2151A3';
        // const amount = 20;
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
        console.log('About to send transactions to server', txs);
        return await client.sendTransactionAsync(network, txs);
    };

    private async save(pd: StakingApp) { 
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