import { Network } from "ferrum-plumbing";

export interface StakingApp {
    tokenName: string;
    stakingCap: string;
    stakedAmount: string;
    withdrawEnds: number;
    withdrawStarts: number;
    stakingEnds: number;
    stakingStarts: number;
    version: number;
    network: Network;
    currency: string;
    contractAddress: string;
    createdAt: number;
    symbol: string;
}
