import React from 'react';
import { PrimaryButton } from '@fluentui/react';
import { inject } from '../../common/IocModule';
import { PairAddressService } from '../../tokenBridge/PairAddressService';
import { Connect } from 'unifyre-extension-web3-retrofit';
import { PairedAddress, SignedPairAddress } from '../../tokenBridge/TokenBridgeTypes';
// @ts-ignore
import { Row } from 'unifyre-web-components';

const TEST_PAIRED_ADDRESS: PairedAddress = {
        address1: '',
        address2: '',
        network1: 'ETHEREUM',
        network2: 'RINKEBY'
};

const TEST_DATA: any = {
    sig: {
        pair: TEST_PAIRED_ADDRESS,
        signature2: '',
        signature1: '',
    } as SignedPairAddress,
}

async function signAddressPairing1() {
    const [sig, addr] = await signAddressPairing(TEST_PAIRED_ADDRESS.network1);
    if (sig) {
        TEST_PAIRED_ADDRESS.address1 = addr;
        const sigPair: SignedPairAddress = {
            ...TEST_DATA.sig,
            pair: TEST_PAIRED_ADDRESS,
            signature1: sig,
        }
        TEST_DATA.sig = sigPair;
        console.log('TEST_DATA', {TEST_DATA});
    }
}

async function signAddressPairing2() {
    const [sig, addr] = await signAddressPairing(TEST_PAIRED_ADDRESS.network2);
    if (sig) {
        TEST_PAIRED_ADDRESS.address2 = addr;
        const sigPair: SignedPairAddress = {
            ...TEST_DATA.sig,
            pair: TEST_PAIRED_ADDRESS,
            signature2: sig,
        }
        TEST_DATA.sig = sigPair;
        console.log('TEST_DATA', {TEST_DATA});
    }
}

async function signAddressPairing(expectedNetwork: string) {
    const svc = inject<PairAddressService>(PairAddressService);
    const connect = inject<Connect>(Connect);
    const network = connect.network() as any;
    const addr = connect.account()!;
    if (network !== expectedNetwork) {
        alert(`Expected ${expectedNetwork} but got ${network}`);
        return [];
    }
    TEST_PAIRED_ADDRESS.address1 = addr;
    TEST_PAIRED_ADDRESS.address2 = addr;
    const res = await svc.signPair(network, TEST_PAIRED_ADDRESS);
    console.log(`Signing result is ${res.split('|')[0]}`);
    return [res.split('|')[0], addr];
}

async function verifyAddressPairing() {
    const svc = inject<PairAddressService>(PairAddressService);
    console.log('About to verify', TEST_DATA);
    const res = await svc.verify(TEST_DATA.sig);
    if (res) {
        alert('All good!');
    } else {
        alert('Bad sig');
    }
}

export function BridgeContainer() {
    return (
        <>
        <Row>
        <PrimaryButton onClick={()=>signAddressPairing1()}>Sign a pair (signature 1)</PrimaryButton>
        </Row>
        <Row>
        <PrimaryButton onClick={()=>signAddressPairing2()}>Sign a pair (signature 2)</PrimaryButton>
        </Row>
        <Row>
        <PrimaryButton onClick={()=>verifyAddressPairing()}>Verify the signature</PrimaryButton>
        </Row>
        </>
    );
}