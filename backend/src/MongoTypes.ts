import {ValidationUtils} from "ferrum-plumbing";
import { Schema, Connection, Document } from "mongoose";
import { PoolDrop, PoolDropClaim } from "./Types";

const claimSchema: Schema = new Schema<PoolDropClaim>({
    address: String,
    email: String,
    userId: String,
});

const poolDropSchema: Schema = new Schema<PoolDrop>({
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
    claims: [claimSchema],
    transactionIds: [String],
    cancelled: Boolean,
    executed: Boolean,
    completedLink: String,
    completedMessage: String,
    restrictedParticipants: String
});

export const PoolDropModel = (c: Connection) => c.model<PoolDrop&Document>('poolDrops', poolDropSchema);

export function getEnv(env: string) {
    const res = process.env[env];
    ValidationUtils.isTrue(!!res, `Make sure to set environment variable '${env}'`);
    return res!;
}