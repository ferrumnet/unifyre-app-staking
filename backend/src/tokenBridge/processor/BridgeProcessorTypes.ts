import { MongooseConfig } from "aws-lambda-helper";
import { Connection, Document, Schema } from "mongoose";

export interface BridgeTokenConfig {
    sourceNetwork: string;
    targetNetwork: string;
    sourceCurrency: string;
    targetCurrency: string;
    feeConstant: string;
    feeRatio: string;
}

export interface NetworkRelatedConfig {
    [network: string]: string;
}

export interface BridgeProcessorConfig {
    database: MongooseConfig;
    payer: NetworkRelatedConfig;
    addressManagerEndpoint: string;
    addressManagerSecret: string;
    contractClient: {[k: string]: string};
}

//@ts-ignore
const bridgeTokenConfigSchema: Schema = new Schema<BridgeProcessorConfig>({
    sourceNetwork: String,
    targetNetwork: String,
    sourceCurrency: String,
    targetCurrency: String,
    feeConstant: String,
    feeRatio: String,
});

export const BridgeTokenConfigModel = (c: Connection) =>
    c.model<BridgeTokenConfig&Document>('bridgeTokenConfig', bridgeTokenConfigSchema);
