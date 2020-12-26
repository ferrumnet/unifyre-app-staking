import {ValidationUtils} from "ferrum-plumbing";
import { Schema, Connection, Document } from "mongoose";
import { GroupInfo, StakeEvent, StakingApp, } from "./Types";

const StakingAppSchema: Schema = new Schema<StakingApp>({
    contractType: String,
    network: String,
    currency: String,
    rewardCurrency: String,
    groupId: String,
    symbol: String,
    rewardSymbol: String,
    contractAddress: String,
    rewardContinuationAddress: String,
    rewardContinuationCurrency: String,
    name: String,
    tokenAddress: String,
    stakedBalance: String,
    rewardBalance: String,
    stakingCap: String,
    stakedTotal: String,
    totalReward: String,
    earlyWithdrawReward: String,
    withdrawStarts: Number,
    withdrawEnds: Number,
    stakingStarts: Number,
    stakingEnds: Number,
    minContribution: String,
    maxContribution: String,
    emailWhitelist: String,
    addressWhitelist: String,
    backgroundImage: String,
    backgroundImageDesktop: String,
    logo: String,
    color: String,
    filled: Boolean,
});

const StakeEventSchema: Schema = new Schema<StakeEvent>({
  contractType: String,
  type: String,
  network: String,
  version: Number,
  createdAt: Number,
  contractAddress: String,
  contractName: String,
  currency: String,
  symbol: String,
  rewardCurrency: String,
  rewardSymbol: String,
  userAddress: String,
  email: String,
  userId: String,
  amountStaked: String,
  amountUnstaked: String,
  amountOfReward: String,
  approveTxIds: [String],
  mainTxId: String,
  transactionStatus: String,
});

const groupInfoSchema: Schema = new Schema<GroupInfo>({
  groupId: String,
  ThemeVariables: Object,
  defaultCurrency: String,
});

export const StakingAppModel = (c: Connection) => c.model<StakingApp&Document>('staking', StakingAppSchema);

export const StakeEventModel = (c: Connection) => c.model<StakeEvent&Document>('stakeEvent', StakeEventSchema);

export const GroupInfoModel = (c: Connection) => c.model<GroupInfo&Document>('groupInfo', groupInfoSchema);

export function getEnv(env: string) {
    const res = process.env[env];
    ValidationUtils.isTrue(!!res, `Make sure to set environment variable '${env}'`);
    return res!;
}