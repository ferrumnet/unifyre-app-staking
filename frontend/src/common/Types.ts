import { Network } from "ferrum-plumbing";

export type StakingContractType = 'staking' | 'stakeFarming';

export interface StakingApp {
    contractType: StakingContractType;
    network: Network;
    currency: string;
    rewardCurrency?: string;
    groupId: string;
    symbol: string;
    rewardSymbol?: string;
    rewardTokenPrice?: string;
    contractAddress: string;
    name: string;
    tokenAddress: string;
    rewardTokenAddress?: string;
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
    minContribution?: string;
    maxContribution?: string;
    emailWhitelist?: string;
    logo?: string;
    color?: string;
    backgroundImage?: string;
    backgroundImageDesktop?: string;
    filled: boolean;
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
}

export interface GroupInfo {
  groupId: string;
  themeVariables: any;
  defaultCurrency: string;
  homepage: string;
  noMainPage: boolean; // Main page should redirect to home page
  headerHtml?: string;
  footerHtml?: string;
}