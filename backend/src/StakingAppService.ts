import { MongooseConnection } from "aws-lambda-helper";
import { Connection, Model, Document } from "mongoose";
import { Injectable, ValidationUtils, RetryableError, retry } from "ferrum-plumbing";
import { UnifyreExtensionKitClient } from "unifyre-extension-sdk";
import { StakingApp } from "./Types";
import { StakingAppModel } from "./MongoTypes";
import { AppLinkRequest } from "unifyre-extension-sdk/dist/client/model/AppLink";
import { SmartContratClient } from "./SmartContractClient";
import { timeStamp } from "console";

export class StakingAppService extends MongooseConnection implements Injectable {
    private model: Model<StakingApp & Document, {}> | undefined;
    constructor(
        private uniClientFac: () => UnifyreExtensionKitClient,
        private contract: SmartContratClient,
    ) { super(); }

    initModels(con: Connection): void {
        this.model = StakingAppModel(con)
    }

    async getStakeInfo(
        token: string,
        currency: string
    ): Promise<any> {
        const stake = await this.contract.stakeToken(token,currency)
    }
}