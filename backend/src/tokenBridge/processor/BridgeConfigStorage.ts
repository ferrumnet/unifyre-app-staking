import { MongooseConnection } from "aws-lambda-helper";
import { Injectable } from "ferrum-plumbing";
import { Connection, Document, Model } from "mongoose";
import { BridgeTokenConfig, BridgeTokenConfigModel } from "./BridgeProcessorTypes";

export class BridgeConfigStorage extends MongooseConnection implements Injectable {
    private con: Connection|undefined;
    private model?: Model<BridgeTokenConfig&Document>;
    constructor(
    ) {
        super();
    }

    initModels(con: Connection): void {
        this.model = BridgeTokenConfigModel(con);
        this.con = con;
    }

    __name__() { return 'BridgeConfigStorage'; }

    async tokenConfig(sourceNetwork: string, targetNetwork: string): Promise<BridgeTokenConfig|undefined> {
        this.verifyInit();
        const r = await this.model!.findOne({'$and': [{sourceNetwork}, {targetNetwork}]}).exec();
        return !!r ? r.toJSON() : undefined;
    }

    async getSourceCurrencies(sourceNetwork: string): Promise<any[]> {
        this.verifyInit();
        const rt = await this.model!.find({});
        const r = await this.model!.find({sourceNetwork});
        if (r) {
            return r
        }
        return [];
    }

    async close() {
        if (this.con) {
            await this.con!.close();
        }
    }
}