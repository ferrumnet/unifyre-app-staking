import { Network, EncryptedData } from "ferrum-plumbing";
import { MongooseConfig } from "aws-lambda-helper";

export interface StakingApp {
    network: Network;
    currency: string;
    symbol: string;
    contractAddress: string;
    name: string;
    tokenAddress: string;
    stakedBalance: string;
    rewardBalance: string;
    stakingCap: string;
    stakedTotal: string;
    earlyWithdrawReward: string;
    totalReward: string;
    withdrawStarts: number;
    withdrawEnds: number;
    stakingStarts: number;
    stakingEnds: number;
}

export interface UserStake {
    userId: string;
    network: string;
    currency: string;
    userAddress: string;
    contractAddress: string;
    amountInStake: string;
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
    adminSecret: string;
}