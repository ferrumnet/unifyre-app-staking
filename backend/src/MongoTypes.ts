import {ValidationUtils} from "ferrum-plumbing";
import { Schema, Connection, Document } from "mongoose";
import { StakingApp } from "./Types";


const StakingAppSchema: Schema = new Schema<StakingApp>({
    id: String,
    creatorId: String,
    createdAt: Number,
    displayName: String,
    network: String,
    currency: String,
    symbol: String,
    totalAmount: String,
    numberOfParticipants: Number,
    participationAmount: String,
    participationAmountFormatted: String,
    transactionIds: [String],
    cancelled: Boolean,
    executed: Boolean,
    completedLink: String,
    completedMessage: String,
    restrictedParticipants: String
});

export const StakingAppModel = (c: Connection) => c.model<StakingApp&Document>('StakingApp', StakingAppSchema);

export function getEnv(env: string) {
    const res = process.env[env];
    ValidationUtils.isTrue(!!res, `Make sure to set environment variable '${env}'`);
    return res!;
}