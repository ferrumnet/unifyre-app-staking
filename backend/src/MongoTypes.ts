import {ValidationUtils} from "ferrum-plumbing";
import { Schema, Connection, Document } from "mongoose";
import { StakingApp, UserStake, } from "./Types";

const StakingAppSchema: Schema = new Schema<StakingApp>({
    network: String,
    currency: String,
    symbol: String,
    contractAddress: String,
    name: String,
    tokenAddress: String,
    stakedBalance: String,
    rewardBalance: String,
    stakingCap: String,
    stakedTotal: String,
    totalReward: String,
    withdrawStarts: Number,
    withdrawEnds: Number,
    stakingStarts: Number,
    stakingEnds: Number,
});

const UserStakeSchema: Schema = new Schema<UserStake>({
    userId: String,
    contractAddress: String,
    amountInStake: String,
    currency: String,
    createdAt: Number
});

export const StakingAppModel = (c: Connection) => c.model<StakingApp&Document>('staking', StakingAppSchema);

export const UserStakingAppModel = (c: Connection) => c.model<UserStake&Document>('userStake', UserStakeSchema);

export function getEnv(env: string) {
    const res = process.env[env];
    ValidationUtils.isTrue(!!res, `Make sure to set environment variable '${env}'`);
    return res!;
}