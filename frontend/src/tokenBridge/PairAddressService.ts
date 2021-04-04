import { Injectable, Network } from "ferrum-plumbing";
import { Connect, UnifyreExtensionWeb3Client } from "unifyre-extension-web3-retrofit";
import { eip712Json, eipTransactionRequest } from "unifyre-extension-web3-retrofit/dist/client/Eip712";
import { domainSeparator, PairedAddress, PairedAddressType, SignedPairAddress } from "./TokenBridgeTypes";
import { PairAddressUtils } from "./PairAddressUtils";

export class PairAddressService implements Injectable {
    constructor(
        private client: UnifyreExtensionWeb3Client,
        private connect: Connect,
    ) {}

    __name__() { return 'PairAddressService'; }

    async signPair(network: Network, pair: PairedAddress) {
        const jsonData = eip712Json(domainSeparator(network), PairedAddressType, 'Pair', pair);
        const request = eipTransactionRequest(
            this.connect.getProvider()!.web3()!, this.connect.account()!, jsonData);
        return await this.client.sendAsync(request);
    }

    async signPairAddress1(pair: PairedAddress) {
        PairAddressUtils.validatePair(pair);
        return this.signPair(pair.network1 as Network, pair);
    }

    async signPairAddress2(pair: PairedAddress) {
        PairAddressUtils.validatePair(pair);
        return this.signPair(pair.network2 as Network, pair);
    }
}