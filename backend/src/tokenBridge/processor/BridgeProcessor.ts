import { ChainClientFactory, SimpleTransferTransaction } from "ferrum-chain-clients";
import { Injectable, Logger, LoggerFactory, Network, ValidationUtils } from "ferrum-plumbing";
import { Big } from 'big.js';
import { BridgeProcessorModule } from "./BridgeProcessorModule";
import { LambdaGlobalContext } from "aws-lambda-helper";
import { PairAddressSignatureVerifyre } from "../common/PairAddressSignatureVerifyer";
import { TokenBridgeService } from "../TokenBridgeService";
import { BridgeProcessorConfig } from "./BridgeProcessorTypes";
import { CHAIN_ID_FOR_NETWORK, PayBySignatureData, UserBridgeWithdrawableBalanceItem } from "../TokenBridgeTypes";
import { BridgeConfigStorage } from "./BridgeConfigStorage";
import { EthereumSmartContractHelper } from "aws-lambda-helper/dist/blockchain";
import { fixSig, produceSignatureWithdrawHash, randomSalt } from "./BridgeUtils";
import { toRpcSig } from 'ethereumjs-util';

export class BridgeProcessor implements Injectable {
    private log: Logger;
    constructor(
        private config: BridgeProcessorConfig,
        private chain: ChainClientFactory,
        private svc: TokenBridgeService,
        private tokenConfig: BridgeConfigStorage,
        private pairVerifyer: PairAddressSignatureVerifyre,
        private helper: EthereumSmartContractHelper,
        logFac: LoggerFactory,
        ) {
        this.log = logFac.getLogger('BridgeProcessor')
    }

    __name__() { return 'BridgeProcessor'; }

    async processCrossChain(network: Network) {
        /**
         * Find all incoming transactions for the given network.
         * Get the sender details from mongo and verify the pair target.
         * Send tokens to their address.
         */
        const poolAddress = this.config.payer[network];
        ValidationUtils.isTrue(!!poolAddress, `No payer for ${network} is configured`);
        const client = this.chain.forNetwork(network);
        const relevantTokens = await this.tokenConfig.getSourceCurrencies(network);
        ValidationUtils.isTrue(!!relevantTokens.length, `No relevent token found in config for ${network}`);
        try {
            const incoming = await client.getRecentTransactionsByAddress(
                poolAddress, relevantTokens);
            if (!incoming) {
                this.log.info('No recent transaction for address ' + poolAddress);
                return;
            }
            for (const tx of incoming) {
                this.log.info(`Processing transaction ${tx.id}`);
                const [existed, _] = await this.processSingleTransaction(tx);
                if (existed) {
                    this.log.info(`Reached a transaction that was already processed: ${tx.id}`);
                    return;
                }
            }
        } finally {
            await this.svc.close();
            await this.tokenConfig.close();
        }
    }

    private async getAndValidatePairForTransaction(tx: SimpleTransferTransaction):
        Promise<UserBridgeWithdrawableBalanceItem | undefined> {
        const network = tx.network;
        if (!(tx.fromItems || []).length) {
            return undefined;
        }
        const userAddress = tx.fromItems[0].address;
        const unverifiedPair = await this.svc.getUserPairedAddress(network, userAddress);
        if (!this.pairVerifyer.verify(unverifiedPair)) {
            this.log.info(`[${network}] Unverified pair ${unverifiedPair} related to the transaction ${tx.id}. Cannot process`); 
            return undefined;
        }
        return unverifiedPair;
    }

    private async processSingleTransaction(tx: SimpleTransferTransaction):
        Promise<[Boolean, UserBridgeWithdrawableBalanceItem?]> {
        try {
            const pair = await this.getAndValidatePairForTransaction(tx);
            if (!pair) {
                this.log.info(`No pair for the transactino: ${tx.id}`);
                return [false, undefined];
            }
            let processed = await this.svc.getWithdrawItem(tx.id);
            if (!!processed) {
                return [true, processed];
            }

            // Creating a new process option.
            // Find the relevant token config for the pair
            // Calculate the target amount
            const sourceNetwork = pair.receiveNetwork === tx.network ? pair.receiveNetwork :
                pair.sendNetwork;
            const sourceAddress = pair.receiveNetwork === tx.network ? pair.receiveAddress :
                pair.sendAddress;
            const targetNetwork = pair.receiveNetwork === tx.network ? pair.sendNetwork :
                pair.receiveNetwork;
            const targetAddress = pair.receiveNetwork === tx.network ? pair.sendAddress :
                pair.receiveAddress;
            const conf = await this.tokenConfig.tokenConfig(sourceNetwork, targetNetwork);
            ValidationUtils.isTrue(!!conf, `No token config between ${pair} networks (source ${tx.network})`);

            const sourceAmount = new Big(tx.toItems[0].amount);
            let targetAmount = sourceAmount.minus(new Big(conf!.feeConstant || '0'));
            if (targetAmount.lt(new Big(0))) {
                targetAmount = new Big(0);
            }
            ValidationUtils.isTrue(sourceAddress === tx.fromItems[0].address, 
                `UNEXPECTED ERROR: Source address is different from the transaction source ${tx.id}`);
            const payBySig = await this.createSignedPayment(
                targetNetwork, targetAddress, conf!.targetCurrency, targetAmount.toFixed(),
            );
            processed = {
                id: payBySig.hash, // same as signedWithdrawHash
                timestamp: new Date().valueOf(),
                receiveNetwork: conf!.sourceNetwork,
                receiveCurrency: conf!.sourceCurrency,
                receiveTransactionId: tx.id,
                receiveAddress: sourceAddress,
                receiveAmount: sourceAmount.toFixed(),
                payBySig,

                sendNetwork: targetNetwork,
                sendAddress: targetAddress,
                sendTimestamp: new Date().valueOf(),
                sendCurrency: conf?.targetCurrency,
                sendAmount: targetAmount.toFixed(),

                used: '',
                useTransactions: [],
            } as UserBridgeWithdrawableBalanceItem;
            await this.svc.newWithdrawItem(processed);
            return [true, processed];
        } catch (e) {
            this.log.error(`Error when processing transactions "${JSON.stringify(tx)}": ${e}`);
            return [false, undefined];
        }
    }

    async createSignedPayment(network: string, address: string, currency: string, amount: string)
        :Promise<PayBySignatureData> {
            const amountStr = await this.helper.amountToMachine(currency, amount);
            const [_, token] = EthereumSmartContractHelper.parseCurrency(currency);
            const salt = randomSalt();
            const chainId = CHAIN_ID_FOR_NETWORK[network];
            const payBySig = produceSignatureWithdrawHash(
                this.helper.web3(network),
                chainId,
                this.config.payer[network],
                token,
                address,
                amountStr,
                salt,
            );
            // Create signature. TODO: Use a more secure method. Address manager is not secure enough.
            // E.g. Have an ecnrypted SK as ENV. Configure KMS to only work with a certain IP
            const sigP = await this.chain.forNetwork(network as any).sign('', payBySig.hash, true);
            const rpcSig = fixSig(toRpcSig(sigP.v, Buffer.from(sigP.r, 'hex'),
                Buffer.from(sigP.s, 'hex'), chainId));
            payBySig.signature = rpcSig;
            ValidationUtils.isTrue(!!payBySig.signature, `Error generating signature for ${(
                {network, address, currency, amount})}`);
            return payBySig;
    }
}

export async function processOneWay(network: string) {
        const c = await LambdaGlobalContext.container();
        await c.registerModule(new BridgeProcessorModule());
        const processor = c.get<BridgeProcessor>(BridgeProcessor);
        await processor.processCrossChain(network as any);
}