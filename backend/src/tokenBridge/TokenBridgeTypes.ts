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

export const CHAIN_ID_FOR_NETWORK = {
    'ETHEREUM': 1,
    'RINKEBY': 4,
    'BSC': 56,
    'BSC_TESTNET': 97,
} as any

export interface PayBySignatureData {
    token: string;
    payee: string;
    amount: string;
    salt: string;
    signature: string;
    hash: string;
}

// Every transaction sent by user using a paired address to the bridge contract,
// will produced a Withdrawable Balance Item
export interface UserBridgeWithdrawableBalanceItem {
    id: string; // same as signedWithdrawHash
    timestamp: number;
    receiveNetwork: string;
    receiveCurrency: string;
    receiveTransactionId: string;
    receiveAddress: string;
    receiveAmount: string;

    sendNetwork: string;
    sendAddress: string;
    sendTimestamp: number;
    sendCurrency: string;
    sendAmount: string;
    payBySig: PayBySignatureData;

    used: ''|'pending'|'failed'|'completed';
    useTransactions: { id: string, status: string, timestamp: number }[];
}

export interface UserBridgeLiquidityItem {
    network: string;
    address: string;
    currency: string;
    liquidity: string;
}

//@ts-ignore
const payBySignatureDataSchema: Schema = new Schema<PayBySignatureData&Document>({
    token: String,
    payee: String,
    amount: String,
    salt: String,
    signature: String,
    hash: String,
})

//@ts-ignore
const userBridgeWithdrawableBalanceItemSchema: Schema = new Schema<UserBridgeWithdrawableBalanceItem&Document>({
    id: String, // same as signedWithdrawHash
    timestamp: Number,
    receiveNetwork: String,
    receiveCurrency: String,
    receiveAddress: String,
    receiveAmount: String,
    receiveTransactionId: String,
    salt: String,
    signedWithdrawHash: String,
    signedWithdrawSignature: String,

    sendNetwork: String,
    sendAddress: String,
    sendTimestamp: Number,
    sendTransactionId: String,
    sendCurrency: String,
    sendAmount: String,

    payBySig: payBySignatureDataSchema,

    used: String,
    useTransactions: [{id: String, status: String, timestamp: Number}],
});

//@ts-ignore
const SignedPairAddressSchema: Schema = new Schema<SignedPairAddress&Document>({
    pair: new Schema<PairedAddress&Document>({
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
