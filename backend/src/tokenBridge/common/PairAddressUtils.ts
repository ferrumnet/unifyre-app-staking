import { eip712Json, eipTransactionRequest } from "unifyre-extension-web3-retrofit/dist/client/Eip712";
import { domainSeparator, PairedAddress, PairedAddressType, SignedPairAddress } from "./TokenBridgeTypes";
import { recoverTypedSignature_v4 } from 'eth-sig-util';
import { Network, ValidationUtils } from "ferrum-plumbing";

export class PairAddressUtils {
    static verifyPairSignatureForNetwork(network: Network, pair: PairedAddress, signature: string): boolean {
        // Verify both signatures...
        PairAddressUtils.validatePair(pair);
        const jsonData = JSON.parse(eip712Json(domainSeparator(network), PairedAddressType, 'Pair', pair));
        console.log('VERIFICATION JSON DATA', jsonData);
        const recoveredAddress = recoverTypedSignature_v4({data: jsonData, sig: signature});
        console.log('RECOVERED ADDARDOO ', {recoveredAddress})
        ValidationUtils.isTrue(!!recoveredAddress, 'recoverTypedSignature_v4 could not recover an address');
        const from = network === pair.network1 ? pair.address1 : pair.address2;
        return recoveredAddress.toLowerCase() === from.toLocaleLowerCase();
    }

    static validatePair(pair: PairedAddress) {
        ValidationUtils.isTrue(!!pair.network1, 'pair.network1 must be provided');
        ValidationUtils.isTrue(!!pair.network2, 'pair.network2 must be provided');
        ValidationUtils.isTrue(!!pair.address1, 'pair.address1 must be provided');
        ValidationUtils.isTrue(!!pair.address2, 'pair.address2 must be provided');
    }
}