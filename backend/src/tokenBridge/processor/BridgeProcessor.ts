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
import { toRpcSig, ecrecover } from 'ethereumjs-util';
import { SignedPairAddress } from "../common/TokenBridgeTypes";

export class BridgeProcessor implements Injectable {
    private log: Logger;
    constructor(
        private config: BridgeProcessorConfig,
        private chain: ChainClientFactory,
        private svc: TokenBridgeService,
        private tokenConfig: BridgeConfigStorage,
        private pairVerifyer: PairAddressSignatureVerifyre,
        private helper: EthereumSmartContractHelper,
        private privateKey: string,
        private processorAddress: string,
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
            console.log(relevantTokens.map((j:any) => j.sourceCurrency),'soucre currencies');
            const incoming = await client.getRecentTransactionsByAddress(
                poolAddress, relevantTokens.map((j:any) => j.sourceCurrency));
                //@ts-ignore
            // console.log('Got icoming txs:', {...incoming},{...incoming})
            if (!incoming || !incoming.length) {
                this.log.info('No recent transaction for address ' + poolAddress);
                return;
            }
            
            for (const tx of incoming.reverse()) {
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
        Promise<SignedPairAddress | undefined> {
        const network = tx.network;
        if (!(tx.fromItems || []).length) {
            return undefined;
        }
        const userAddress = tx.fromItems[0].address;
        const unverifiedPair = await this.svc.getUserPairedAddress(network, userAddress);
        console.log('Geting pair for address ', userAddress, unverifiedPair);
        if (!unverifiedPair || !this.pairVerifyer.verify(unverifiedPair!)) {
            this.log.info(`[${network}] Unverified pair ${unverifiedPair} related to the transaction ${tx.id}. Cannot process`);
            return undefined;
        }
        return unverifiedPair;
    }

    private async processSingleTransaction(tx: SimpleTransferTransaction):
        Promise<[Boolean, UserBridgeWithdrawableBalanceItem?]> {
        try {
            let processed = await this.svc.getWithdrawItem(tx.id);
            if (!!processed) {
                return [true, processed];
            } else {
            }

            const pair = await this.getAndValidatePairForTransaction(tx);
            if (!pair) {
                this.log.info(`No pair for the transactino: ${tx.id}`);
                return [false, undefined];
            }

            // Creating a new process option.
            // Find the relevant token config for the pair
            // Calculate the target amount
            const sourceNetwork = tx.network;
            const sourceAddress = pair.pair.network1 === tx.network ? pair.pair.address1 :
                pair.pair.network2 === tx.network ? pair.pair.address2 : undefined;
            const targetNetwork = pair.pair.network1 === tx.network ? pair.pair.network2 :
                pair.pair.network1;
            const targetAddress = pair.pair.network1 === tx.network ? pair.pair.address2 :
                pair.pair.address1;
            ValidationUtils.isTrue(!!sourceAddress, `Pairs (${pair}) source and destination don''t match transaction ${tx}`);
            const conf = await this.tokenConfig.tokenConfig(sourceNetwork, targetNetwork);
            ValidationUtils.isTrue(!!conf, `No token config between ${JSON.stringify(pair)} networks (source ${tx.network})`);

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
            await this.svc.withdrawSignedVerify(conf!.targetCurrency, targetAddress,
                targetAmount.toFixed(),
                payBySig.hash,
                payBySig.salt,
                payBySig.signature,
                this.processorAddress);
            await this.svc.newWithdrawItem(processed);
            return [true, processed];
        } catch (e) {
            this.log.error(`Error when processing transactions "${JSON.stringify(tx)}": ${e}`);
            return [false, undefined];
        }
    }

    async createSignedPayment(network: string, address: string, currency: string, amount: string)
        : Promise<PayBySignatureData> {
        const amountStr = await this.helper.amountToMachine(currency, amount);
        const [_, token] = EthereumSmartContractHelper.parseCurrency(currency);
        // const salt = '0x0000000000000000000000000000000000000000000000000000000000000000' // TODO: randomSalt();
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
        const sigP = await this.chain.forNetwork(network as any)
            .sign(this.privateKey, payBySig.hash.replace('0x', ''), true);
        // Verify the signature...
        const baseV = sigP.v - chainId * 2 - 8;
        const rpcSig = fixSig(toRpcSig(baseV + 2 + 8, Buffer.from(sigP.r, 'hex'),
            Buffer.from(sigP.s, 'hex'), 1));
        payBySig.signature = rpcSig;
        ValidationUtils.isTrue(!!payBySig.signature, `Error generating signature for ${(
            { network, address, currency, amount })}`);
        return payBySig;
    }
}

export async function processOneWay(network: string) {
    const c = await LambdaGlobalContext.container();
    await c.registerModule(new BridgeProcessorModule());
    const processor = c.get<BridgeProcessor>(BridgeProcessor);
    await processor.processCrossChain(network as any);
}
