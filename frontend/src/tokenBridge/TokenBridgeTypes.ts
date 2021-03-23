import {DomainSeparator, Eip712TypeDefinition} from 'unifyre-extension-web3-retrofit/dist/client/Eip712';

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

export const PairedAddressType: Eip712TypeDefinition =  {
    Pair: [
        { name: 'network1', type: 'bytes32' },
        { name: 'address1', type: 'address' },
        { name: 'network2', type: 'bytes32' },
        { name: 'address2', type: 'address' },
    ],
};

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

export function domainSeparator(network: string): DomainSeparator {
    const chainId = CHAIN_ID_FOR_NETWORK[network];
    return ({
        chainId: chainId,
        name: 'PairedUnifyreWallet',
        salt: TOKEN_BRIDGE_DOMAIN_SALT,
        verifyingContract: BRIDGE_CONTRACT[network],
        version: '0.1.0',
    });
};