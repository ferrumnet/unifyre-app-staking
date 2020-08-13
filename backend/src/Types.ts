import { Network, EncryptedData } from "ferrum-plumbing";
import { MongooseConfig } from "aws-lambda-helper";

export interface StakingAppClaim {
    address: string;
    userId: string;
    email?: string;
}

export interface StakingApp {
    tokenName: string;
    stakingCap: number;
    stakedAmount: number;
    withdrawEnds: number;
    withdrawStarts: number;
    stakingEnds: number;
    stakingStarts: number;
    version: number;
    network: Network;
    creatorAddress: string;
    createdAt: number;
    symbol: string;
    numberOfStakeParticipants?: number;
}

export interface stake {
    amount: number;
    userAddress: string;
    currency: string;
}
export interface StakingAppConfig {
    database: MongooseConfig;
    region: string;
    authRandomKey: string;
    signingKeyHex?: string;
    signingKey?: EncryptedData;
    web3ProviderRinkeby: string;
    web3ProviderEthereum: string;
    backend: string;
    cmkKeyArn: string;
}