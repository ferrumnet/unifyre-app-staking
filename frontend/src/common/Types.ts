import { Network } from "ferrum-plumbing";

export interface StakingApp {
    network: Network;
    currency: string;
    symbol: string;
    contractAddress: string;
    tokenAddress: string;
    stakedBalance: string;
    rewardBalance: string;
    stakingCap: string;
    stakedTotal: string;
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
