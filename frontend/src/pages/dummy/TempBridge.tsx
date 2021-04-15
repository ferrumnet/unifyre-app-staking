import React, { useEffect, useState } from 'react';
import { PrimaryButton } from '@fluentui/react';
import { inject, IocModule } from '../../common/IocModule';
import { PairAddressService } from '../../tokenBridge/PairAddressService';
import { Connect } from 'unifyre-extension-web3-retrofit';
import { PairedAddress, SignedPairAddress, UserBridgeWithdrawableBalanceItem } from '../../tokenBridge/TokenBridgeTypes';
// @ts-ignore
import { Row } from 'unifyre-web-components';
import { PairAddressSignatureVerifyre } from '../../tokenBridge/PairAddressSignatureVerifyer';
import { TokenBridgeClient } from '../../tokenBridge/TokenBridgeClient';
import { ConnectorContainer } from '../../connect/ConnectContainer';
import { ConButton } from '../../base/NavBar';
import { RootState } from '../../common/RootState';

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
        alert(`expected ${expectedNetwork} but got ${network}`);
        return [];
    }
    TEST_PAIRED_ADDRESS.address1 = addr;
    TEST_PAIRED_ADDRESS.address2 = addr;
    const res = await svc.signPair(network, TEST_PAIRED_ADDRESS);
    console.log(`Signing result is ${res.split('|')[0]}`);
    return [res.split('|')[0], addr];
}

async function verifyAddressPairing() {
    const vfy = inject<PairAddressSignatureVerifyre>(PairAddressSignatureVerifyre);
    console.log('About to verify', TEST_DATA);
    const res = await vfy.verify(TEST_DATA.sig);
    if (res) {
        alert('All good!');
    } else {
        alert('Bad sig');
    }
}

const dummyDispatch: any = () => {};

async function claimWithdraw(item: UserBridgeWithdrawableBalanceItem) {
    const client = inject<TokenBridgeClient>(TokenBridgeClient);
    const wd = await client.withdraw(dummyDispatch, item);
    console.log('WITHDRAW RESULTS ', wd);
}

async function swap10Frm() {
    const connect = inject<Connect>(Connect);
    const network = connect.network() as any;
    const client = inject<TokenBridgeClient>(TokenBridgeClient);
    const FRM = `${network}:0xfe00ee6f00dd7ed533157f6250656b4e007e7179`;
    const targetNet = network === 'RINKEBY' ? 'BSC_TESTNET' : network;
    const TARGET_FRM = `${targetNet}:0xfe00ee6f00dd7ed533157f6250656b4e007e7179`;
    if (targetNet !== 'RINKEBY' && targetNet !== 'BSC_TESTNET') {
        alert('Only use RINKEBY and BSC_TESTNET for this test');
    }
    await client.swap(dummyDispatch, FRM, '10', TARGET_FRM);
}

async function add100Liq() {
    const connect = inject<Connect>(Connect);
    const network = connect.network() as any;
    const client = inject<TokenBridgeClient>(TokenBridgeClient);
    const FRM = `${network}:0xfe00ee6f00dd7ed533157f6250656b4e007e7179`;
    await client.addLiquidity(dummyDispatch, FRM, '100');
}

async function remove50Liq() {
    const connect = inject<Connect>(Connect);
    const network = connect.network() as any;
    const client = inject<TokenBridgeClient>(TokenBridgeClient);
    const FRM = `${network}:0xfe00ee6f00dd7ed533157f6250656b4e007e7179`;
    await client.removeLiquidity(dummyDispatch, FRM, '50');
}

function WithdrawItemsList(props: {connected: boolean}) {
    const [init, setInit] = useState(false);
    const [bridgeItems, setBridgeItems] = useState([]);
    const {connected} = props;
    const loadBalanceItems = async () => {
        const c = inject<TokenBridgeClient>(TokenBridgeClient);
        if (!c.getUserAddress()) {
            console.log('Not getting items. Not signed in')
            return;
        }
        // Must be already signed in.
        console.log('About to get items ',);
        const items = await c.loadUserBridgeBalance(dummyDispatch);
        console.log('Got items ', items);
        setBridgeItems(items as any);
    };
    return (
        <>
        <h3>BALANCE ITEMS:</h3>
                <PrimaryButton
                    onClick={()=>loadBalanceItems()}
                >Load</PrimaryButton>
        
        {(bridgeItems as UserBridgeWithdrawableBalanceItem[]).map((bi, i) => (
            <React.Fragment key={i}>
            <Row >
                <h3>id: {bi.id}</h3><br/>
            </Row><Row>
                <h3>Source Address: {bi.receiveAddress}</h3><br/>
            </Row><Row>
                <h3>amount: {bi.receiveAmount}</h3><br/>
            </Row><Row>
                <h3>currency: {bi.receiveCurrency}</h3><br/>
            </Row><Row>
                <h3>network: {bi.receiveNetwork}</h3><br/>
            </Row><Row>
                <h3>Source transaction ID: {bi.receiveTransactionId}</h3><br/>
            </Row><Row>
                <h3>Claim address: {bi.sendAddress}</h3><br/>
            </Row><Row>
                <h3>Claim network: {bi.sendNetwork}</h3><br/>
            </Row><Row>
                <h3>Claim currency: {bi.sendCurrency}</h3><br/>
            </Row><Row>
                <h3>Transactions: {JSON.stringify(bi.useTransactions)}</h3><br/>
            </Row><Row>
                <PrimaryButton
                    onClick={()=>claimWithdraw(bi)}
                >CLAIM</PrimaryButton><br/>
            </Row>
            </React.Fragment>
        ))}
        </>);
}

export function DummyBridgeContainer(props: {onConnected: () => {}}) {
    const [connected, setConnected] = useState(false);
    const ConBot = ConnectorContainer.Connect(IocModule.container(), ConButton);
    return (
        <>
        <Row>
                                <ConBot 
                                    onConnect={() => {setConnected(true); return true;}}
                                    dataSelector={(state: RootState) => state.data.userData}
                                    appInitialized={true}
                                />
        </Row>
        <Row>
        <PrimaryButton onClick={()=>signAddressPairing1()}>Sign a pair (signature 1)</PrimaryButton>
        </Row>
        <Row>
        <PrimaryButton onClick={()=>signAddressPairing2()}>Sign a pair (signature 2)</PrimaryButton>
        </Row>
        <Row>
        <PrimaryButton onClick={()=>verifyAddressPairing()}>Verify the signature</PrimaryButton>
        </Row>
        <WithdrawItemsList connected={connected} />
        <Row>
        <PrimaryButton onClick={()=>swap10Frm()}>SWAP 10 FRM</PrimaryButton>
        </Row>
        <Row>
        <PrimaryButton onClick={()=>add100Liq()}>ADD 100 LIQUIDITY</PrimaryButton>
        </Row>
        <Row>
        <PrimaryButton onClick={()=>remove50Liq()}>REMOVE 50 LIQUIDITY</PrimaryButton>
        </Row>
        </>
    );
}
