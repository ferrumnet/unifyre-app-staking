import { Network, EncryptedData } from "ferrum-plumbing";
import { MongooseConfig } from "aws-lambda-helper";

export type StakingContractType = 'staking' | 'stakeFarming';

export interface StakingApp {
    contractType: StakingContractType;
    network: Network;
    _id: string;
    currency: string;
    rewardCurrency?: string;
    groupId: string;
    symbol: string;
    rewardSymbol?: string;
    rewardTokenPrice?: string;
    contractAddress: string;
    rewardContinuationAddress?: string;
    rewardContinuationCurrency?: string;
    rewardContinuationSymbol?: string;
    name: string;
    tokenAddress: string;
    rewardTokenAddress?: string;
    stakedBalance: string;
    rewardBalance: string;
    stakingCap: string;
    stakedTotal: string;
    earlyWithdrawReward: string;
    earlyWithdrawRewardSentence?: string;
    totalReward: string;
    totalRewardSentence?: string;
    withdrawStarts: number;
    withdrawEnds: number;
    stakingStarts: number;
    stakingEnds: number;
    minContribution?: string;
    maxContribution?: string;
    emailWhitelist?: string;
    addressWhitelist?: string;
    logo?: string;
    color?: string;
    backgroundImage?: string;
    backgroundImageDesktop?: string;
    filled: boolean;
    rewardContinuationParagraph?: string;
    gasLimitOverride?: string;
    isLegacy: boolean;
    _v: number
}

export interface StakeEvent {
  contractType: StakingContractType,
  type: 'stake' | 'unstake';
  network: string;
  version: number;
  createdAt: number;
  contractAddress: string;
  contractName: string;
  currency: string;
  symbol: string;
  rewardCurrency?: string;
  rewardSymbol?: string;
  userAddress: string;
  email: string;
  userId: string;
  amountStaked: string;
  amountUnstaked: string;
  amountOfReward: string;
  approveTxIds: string[];
  mainTxId: string;
  transactionStatus: 'timedout' | 'failed' | 'pending' | 'successful'
}

export interface UserStake {
    userId: string;
    network: string;
    currency: string;
    userAddress: string;
    contractAddress: string;
    amountInStake: string;
    continuationRewards?: string;
}

export interface TokenBridgeConfig {
  contractClient: {[k: string]: string};
}

export interface StakingAppConfig {
    database: MongooseConfig;
    region: string;
    authRandomKey: string;
    signingKeyHex?: string;
    signingKey?: EncryptedData;
    web3ProviderRinkeby: string;
    web3ProviderEthereum: string;
    web3ProviderBsc: string;
    web3ProviderBscTestnet: string;
    web3ProviderPolygon: string;
    backend: string;
    cmkKeyArn: string;
    adminSecret: string;
    bridgeConfig: TokenBridgeConfig;
}

export interface GroupInfo {
  _id: string;
  groupId: string;
  themeVariables: any;
  defaultCurrency: string;
  homepage: string;
  noMainPage: boolean; // Main page should redirect to home page
  headerHtml?: string;
  footerHtml?: string;
}