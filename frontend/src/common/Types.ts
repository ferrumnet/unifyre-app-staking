import { Network } from "ferrum-plumbing";

export interface StakingApp {
    network: Network;
    name: string;
    currency: string;
    symbol: string;
    contractAddress: string;
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

export interface StakeEvent {
  contractAddress: string;
  contractName: string;
  currency: string;
  symbol: string;
  userAddress: string;
  email: string;
  userId: string;
  amountStaked: string;
  approveTxIds: string[];
  stakeTxId: string;
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
