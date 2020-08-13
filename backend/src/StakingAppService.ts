import { MongooseConnection } from "aws-lambda-helper";
import { Connection, Model, Document } from "mongoose";
import { Injectable, ValidationUtils, RetryableError, retry } from "ferrum-plumbing";
import { UnifyreExtensionKitClient, ClientModule } from "unifyre-extension-sdk";
import { StakingApp } from "./Types";
import { StakingAppModel } from "./MongoTypes";
import { AppLinkRequest } from "unifyre-extension-sdk/dist/client/model/AppLink";
import { SmartContratClient } from "./SmartContractClient";
import { timeStamp } from "console";
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
        const stake = await this.contract.checkAllowance(currency,'0x91dABa53027154C59a6b32213088a8E5933c759f',20);
        let inst = await this.contract.instance(currency);
        let contractInstance = inst.methods;
        let tokenName = await contractInstance.tokenName().call();
        let tokenContract = await this.contract.contractInfo(currency);
        //let symbol = await contractInstance.symbol().call();
        //let decimals = await contractInstance.decimals().call();
        let stakingBalance = await contractInstance.stakedBalance().call();
        let stakedTotal = await contractInstance.stakedTotal().call();
        let stakingTotal = await contractInstance.stakingTotal().call();
        let withdrawStarts = await contractInstance.withdrawStarts().call();
        let withdrawEnds = await contractInstance.withdrawEnds().call();
        let stakingStarts = await contractInstance.stakingStarts().call();
        let stakingEnds = await contractInstance.stakingEnds().call();
        let address = await contractInstance.address
        let response = await this.save(
            {
                tokenName,
                symbol:tokenContract.symbol,
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
        // const address = '0x0c42cEe7BA62B7969a755E0dC151521c6C2151A3';
        // const amount = 20;
    }


    async AddStake (args: stake) {
        const { amount, userAddress,currency } = args;
        let allowance = 0;
        try {
            await this.contract.stake(userAddress, allowance || amount,currency);
            console.log('Approve was successful, now doing some moew.')
        } catch (e) {
          console.error('Error calling stake', e);
          console.log('Error submitting the stake transaction');
        }
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
        this.AddStake({amount:20, userAddress:'',currency:'ETHERUEM'})
        return pd;
    }
}