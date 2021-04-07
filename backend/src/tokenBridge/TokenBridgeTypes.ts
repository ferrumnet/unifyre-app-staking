import { Connection, Document, Schema } from "mongoose";
import { CustomTransactionCallRequest } from "unifyre-extension-sdk";

export interface RequestMayNeedApprove {
    isApprove: boolean;
    requests: CustomTransactionCallRequest[];
}

export interface PairedAddress {
    network1: string;
    address1: string;
    network2: string;
    address2: string;
}

export interface SignedPairAddress {
    pair: PairedAddress;
    signature1: string;
    signature2: string;
}

export const TOKEN_BRIDGE_DOMAIN_SALT = '0xebb7c67ee709a29f4d80f3ac6db9cd0e84fccb20437963314b825afc2463825c';

const CHAIN_ID_FOR_NETWORK = {
    'ETHEREUM': 1,
    'RINKEBY': 4,
    'BSC': 56,
    'BSC_TESTNET': 97,
} as any

const BRIDGE_CONTRACT = {
    'ETHEREUM': '0x0000000000000000000000000000000000000000',
    'RINKEBY': '0x0000000000000000000000000000000000000000',
    'BSC': '0x0000000000000000000000000000000000000000',
    'BSC_TESTNET': '0x0000000000000000000000000000000000000000',
} as any;

// Every transaction sent by user using a paired address to the bridge contract,
// will produced a Withdrawable Balance Item
export interface UserBridgeWithdrawableBalanceItem {
    id: string; // same as signedWithdrawHash
    timestamp: number;
    receiveNetwork: string;
    receiveCurrency: string;
    receiveAddress: string;
    receiveAmount: string;
    salt: string;
    signedWithdrawHash: string;
    signedWithdrawSignature: string;

    sendNetwork: string;
    sendAddress: string;
    sendTimestamp: number;
    sendTransactionId: string;
    sendCurrency: string;
    sendAmount: string;

    used: ''|'pending'|'failed'|'completed';
    useTransactions: { id: string, status: string, timestamp: number }[];
}

export interface UserBridgeLiquidityItem {
    network: string;
    address: string;
    currency: string;
    liquidity: string;
}

const userBridgeWithdrawableBalanceItemSchema: Schema = new Schema<UserBridgeWithdrawableBalanceItem>({
    id: String, // same as signedWithdrawHash
    timestamp: Number,
    receiveNetwork: String,
    receiveCurrency: String,
    receiveAddress: String,
    receiveAmount: String,
    salt: String,
    signedWithdrawHash: String,
    signedWithdrawSignature: String,

    sendNetwork: String,
    sendAddress: String,
    sendTimestamp: Number,
    sendTransactionId: String,
    sendCurrency: String,
    sendAmount: String,

    used: String,
    useTransactionIds: [String],
});

const SignedPairAddressSchema: Schema = new Schema<SignedPairAddress>({
    pair: new Schema<PairedAddress>({
        network1: String,
        address1: String,
        network2: String,
        address2: String,
    }),
    signature1: String,
    signature2: String,
});

export const UserBridgeWithdrawableBalanceItemModel = (c: Connection) => c.model<UserBridgeWithdrawableBalanceItem&Document>(
    'userBridgeWithdrawableBalanceItem', userBridgeWithdrawableBalanceItemSchema);

export const SignedPairAddressSchemaModel = (c: Connection) => c.model<SignedPairAddress&Document>(
    'signedPairAddress', SignedPairAddressSchema);
