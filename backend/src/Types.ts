import { Network, EncryptedData } from "ferrum-plumbing";
import { MongooseConfig } from "aws-lambda-helper";

export interface StakingAppClaim {
    address: string;
    userId: string;
    email?: string;
}

export interface StakingApp {
    version: number;
    id: string;
    network: Network;
    creatorId: string;
    creatorAddress: string;
    displayName: string;
    createdAt: number;
    currency: string;
    symbol: string;
    totalAmount: string;
    numberOfParticipants: number;
    participationAmount: string;
    participationAmountFormatted: string;
    claims: StakingAppClaim[];
    cancelled: boolean;
    executed: boolean;
    transactionIds: string[];
    completedMessage?: string;
    completedLink?: string;
    restrictedParticipants?: string
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