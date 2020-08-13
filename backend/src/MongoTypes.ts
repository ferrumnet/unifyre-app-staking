import {ValidationUtils} from "ferrum-plumbing";
import { Schema, Connection, Document } from "mongoose";
import { StakingApp } from "./Types";


const StakingAppSchema: Schema = new Schema<StakingApp>({
    tokenName: String,
    stakingCap: Number,
    stakedAmount: Number,
    withdrawEnds: Number,
    withdrawStarts: Number,
    stakingEnds: Number,
    stakingStarts: Number,
    version: Number,
    network: String,
    creatorAddress: String,
    createdAt: Number,
    symbol: String,
    numberOfStakeParticipants: Number,
});

export const StakingAppModel = (c: Connection) => c.model<StakingApp&Document>('staking', StakingAppSchema);

export function getEnv(env: string) {
    const res = process.env[env];
    ValidationUtils.isTrue(!!res, `Make sure to set environment variable '${env}'`);
    return res!;
}