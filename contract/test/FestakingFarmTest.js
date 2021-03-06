const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
// const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
const festakingJson = require('../build/contracts/FestakingFarmTest.json');
const frmJson = require('../build/contracts/DummyToken.json');
const abiDecoder = require('abi-decoder');

const STAKING_CAP = 1000;
const GAS ='5000000';

let accounts;
let festaking;
let frm;
let frmX;
let owner, contractAddress;
let ac1, ac2, ac3;

function wei(val) {
    return web3.utils.toWei(val, 'ether');
}

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    owner = accounts[0];
    ac1 = accounts[1];
    ac2 = accounts[2];
    ac3 = accounts[3];

    frm = await new web3.eth.Contract(frmJson['abi'])
        .deploy({ data: frmJson['bytecode'] })
        .send({ from: owner, gas: GAS });
    frmX = await new web3.eth.Contract(frmJson['abi'])
        .deploy({ data: frmJson['bytecode'] })
        .send({ from: owner, gas: GAS });
    festaking = await new web3.eth.Contract(festakingJson['abi'])
        .deploy({ data: festakingJson['bytecode'], arguments: [
            "Test Staking", frm._address, frmX._address, STAKING_CAP] })
        .send({ from: owner, gas: '5000000' });
    contractAddress = festaking._address;
    console.log('Contract deployed at ', contractAddress)
    // Approve the owner
    await frm.methods.approve(contractAddress, STAKING_CAP).send({from: owner});
    await frmX.methods.approve(contractAddress, STAKING_CAP).send({from: owner});
    const allowance = await frm.methods.allowance(owner, contractAddress).call();
    const allowanceX = await frmX.methods.allowance(owner, contractAddress).call();
    abiDecoder.addABI(festakingJson['abi']);
    console.log('Owner allowance is', allowance.toString(), 'and X', allowanceX.toString());
});

async function allow(addr, amount) {
    await frm.methods.transfer(addr, amount).send({from: owner, gas: GAS});
    await frm.methods.approve(contractAddress, amount).send({from: addr});
    const allowance = await frm.methods.allowance(addr, contractAddress).call();
    assert(allowance.toString() === amount.toString(), 'Allowance didn\'nt happen');
}

async function allowX(addr, amount) {
    await frmX.methods.transfer(addr, amount).send({from: owner, gas: GAS});
    await frmX.methods.approve(contractAddress, amount).send({from: addr});
    const allowance = await frmX.methods.allowance(addr, contractAddress).call();
    assert(allowance.toString() === amount.toString(), 'X-Allowance didn\'nt happen');
}

async function addReward() {
    return festaking.methods.addReward(1000, 500).send({from: owner, gas: GAS});
}

async function call(method, ...args) {
    return await festaking.methods[method](...args).call();
}

async function vars() {
    const stakedTotal = await call('stakedTotal');
    const totalReward = await call('totalReward');
    const earlyWithdrawReward = await call('earlyWithdrawReward');
    const rewardBalance = await call('rewardBalance');
    const stakedBalance = await call('stakedBalance');
    return { stakedTotal, totalReward, earlyWithdrawReward, rewardBalance, stakedBalance };
}

async function balanceX(addr) {
    const res = await frmX.methods.balanceOf(addr).call();
    return res.toString();
}

async function balance(addr) {
    const res = await frm.methods.balanceOf(addr).call();
    return res.toString();
}

async function setUpStakes() {
    await addReward();
    await allow(ac1, 200);
    await allowX(ac1, 200);
    const tx = await festaking.methods.stake(100).send({from: ac1, gas: GAS});
    await getTransactionLogs(tx.transactionHash);
    let stake = await festaking.methods.stakeOf(ac1).call();

    await festaking.methods.stake(100).send({from: ac1, gas: GAS});
    stake = await festaking.methods.stakeOf(ac1).call();
    console.log('ac1 staked ', stake);

    await allow(ac2, 1000);
    await allowX(ac2, 1000);
    await festaking.methods.stake(1000).send({from: ac2, gas: GAS});
    stake = await festaking.methods.stakeOf(ac2).call();
    const allowance = await frm.methods.allowance(ac2, contractAddress).call();
    const allowanceX = await frmX.methods.allowance(ac2, contractAddress).call();
    console.log('ac2 staked ', stake, ' and has allowance of ', allowance, ' it tried to stake 1000 ' +
        'but cap was full');
    console.log('ac2 staked ', stake, ' and has allowanceX of ', allowanceX, ' it tried to stake 1000 ' +
        'but cap was full');
}

async function getTransactionLogs(txId) {
    const receipts = await web3.eth.getTransactionReceipt(txId);
    const decodedLogs = abiDecoder.decodeLogs(receipts.logs);
    decodedLogs.forEach(l => {
        if (l) {
            console.log(JSON.stringify(l));
        }
    });
    return decodedLogs.filter(Boolean);
}

describe('Happy Festaking', () => {
    it('Sets the reward', async () => {
        const totalRewBefore = await festaking.methods.totalReward().call();
        assert.deepStrictEqual(totalRewBefore, '0');
        await allowX(owner, 100)
        await festaking.methods.addReward(100, 10).send({from: owner, gas: GAS});
        let totalRewAfter = await festaking.methods.totalReward().call();
        assert.deepStrictEqual(totalRewAfter, '100');
        let earlyWithdrawReward = await festaking.methods.earlyWithdrawReward().call();
        assert.deepStrictEqual(earlyWithdrawReward, '10');
        console.log('EARLY REWARD PAID OUT')

        await allowX(owner, 100)
        await festaking.methods.addReward(50, 40).send({from: owner, gas: GAS});
        totalRewAfter = await festaking.methods.totalReward().call();
        assert.deepStrictEqual(totalRewAfter, '150');
        earlyWithdrawReward = await festaking.methods.earlyWithdrawReward().call();
        assert.deepStrictEqual(earlyWithdrawReward, '50');
    });

    it('Can add reward after stake close', async function() {
        const totalRewBefore = await festaking.methods.totalReward().call();
        assert.deepStrictEqual(totalRewBefore, '0');
        await allowX(owner, 100)
        await festaking.methods.addReward(100, 10).send({from: owner, gas: GAS});
        let totalRewAfter = await festaking.methods.totalReward().call();
        assert.deepStrictEqual(totalRewAfter, '100');

        // Now moving to fter staking closes
        const time = Math.round(Date.now() / 1000);
        await festaking.methods.setPreWithdrawStart().send({from: owner, gas: GAS});
        const withstart = await festaking.methods.withdrawStarts().call();
        // Make sure cannot stake
        console.log('Setting up stakes', time, withstart, time < Number(withstart))
        try {
            await allow(ac1, 200);
            await festaking.methods.stake(100).send({from: ac1, gas: GAS});
            stake = await festaking.methods.stakeOf(ac1).call();
            console.log('ac1 staked ', stake);
        } catch(e) {
            console.log('Good! Staking failed', e)
        }

        await allowX(owner, 100)
        await festaking.methods.addReward(50, 40).send({from: owner, gas: GAS});
        totalRewAfter = await festaking.methods.totalReward().call();
        assert.deepStrictEqual(totalRewAfter, '150');
    })

    it('Withdraw right after it opens gives no reward', async function() {
        this.timeout(0);
        await setUpStakes();

        // Now moving to the first moment of withdawal phase
        await festaking.methods.setEarlyWithdrawalPeriod(0).send({from: owner, gas: GAS});

        const before = await vars();
        assert.deepStrictEqual(before, {
            stakedTotal: '1000',
            totalReward: '1000',
            earlyWithdrawReward: '500',
            rewardBalance: '1000',
            stakedBalance: '1000',
        });
        const balanceBefore = await balance(ac2);
        const balanceXBefore = await balanceX(ac2);
        assert.deepStrictEqual(balanceBefore, '200');
        assert.deepStrictEqual(balanceXBefore, '1000');

        // Withdraw at the first moment
        const tx = await festaking.methods.withdraw(400).send({from: ac2, gas: GAS});
        await getTransactionLogs(tx.transactionHash);
        let after = await vars();
        assert.deepStrictEqual(after, {
            stakedTotal: '1000',
            totalReward: '1000',
            earlyWithdrawReward: '500',
            rewardBalance: '1000',
            stakedBalance: '600',
        });
        let bal = await balance(ac2);
        let balX = await balanceX(ac2);
        assert.deepStrictEqual(bal, '600');
        assert.deepStrictEqual(balX, '1000');
    });

    it('Withdraw halfway before it ends', async function () {
        this.timeout(0);
        await setUpStakes();

        // Now moving to the half way of withdawal phase
        await festaking.methods.setEarlyWithdrawalPeriod(30000).send({from: owner, gas: GAS});

        const before = await vars();
        assert.deepStrictEqual(before, {
            stakedTotal: '1000',
            totalReward: '1000',
            earlyWithdrawReward: '500',
            rewardBalance: '1000',
            stakedBalance: '1000',
        });

        await festaking.methods.withdraw(400).send({from: ac2, gas: GAS});
        let after = await vars();
        let bal = await balance(ac2);
        let balX = await balanceX(ac2);
        assert.deepStrictEqual(after, {
            stakedTotal: '1000',
            totalReward: '1000',
            earlyWithdrawReward: '500',
            rewardBalance: '900',
            stakedBalance: '600',
        });
        assert.deepStrictEqual(bal, '600');
        assert.deepStrictEqual(balX, '1100');
    });

    it('Withdraw right before close', async function() {
        this.timeout(0);
        await setUpStakes();

        // Now moving to the end of withdawal phase
        await festaking.methods.setEarlyWithdrawalPeriod(59990).send({from: owner, gas: GAS});

        const before = await vars();
        const balanceBefore = await balance(ac2);
        assert.deepStrictEqual(before, {
            stakedTotal: '1000',
            totalReward: '1000',
            earlyWithdrawReward: '500',
            rewardBalance: '1000',
            stakedBalance: '1000',
        });
        assert.deepStrictEqual(balanceBefore, '200');

        await festaking.methods.withdraw(400).send({from: ac2, gas: GAS});
        let after = await vars();
        let bal = await balance(ac2);
        let balX = await balanceX(ac2);
        assert.deepStrictEqual(after, {
            stakedTotal: '1000',
            totalReward: '1000',
            earlyWithdrawReward: '500',
            rewardBalance: '801',
            stakedBalance: '600',
        });
        assert.deepStrictEqual(bal, '600');
        assert.deepStrictEqual(balX, '1199');

        // Now continue after close
        await festaking.methods.setEarlyWithdrawalPeriod(60000).send({from: owner, gas: GAS});

        // Withdraw another 400
        await festaking.methods.withdraw(400).send({from: ac2, gas: GAS});
        after = await vars();
        bal = await balance(ac2);
        balX = await balanceX(ac2);
        // After close reward and stake balance don't change
        assert.deepStrictEqual(after, {
            stakedTotal: '1000',
            totalReward: '1000',
            earlyWithdrawReward: '500',
            rewardBalance: '801',
            stakedBalance: '600',
        });
        // Here ac2 expects ~ 66% of the remaining reward
        // because my balance at the time is ~ 66% of the remaining balance
        assert.deepStrictEqual(bal, (400 + 600).toString());
        assert.deepStrictEqual(balX, (1199 + 801 * 400 / 600).toString());

        let stakes = await festaking.methods.stakeOf(ac2).call();
        assert.deepStrictEqual(stakes, '0');

        var ac1BalXBeforeWd = Number(await balanceX(ac1));
        
        // Withdraw ac1
        await festaking.methods.withdraw(200).send({from: ac1, gas: GAS});
        bal = await balance(ac1);
        balX = await balanceX(ac1);
        assert.deepStrictEqual(bal, (200).toString());
        assert.deepStrictEqual(balX, (ac1BalXBeforeWd + 801 * 200 / 600).toString());
        stakes = await festaking.methods.stakeOf(ac1).call();
        assert.deepStrictEqual(stakes, '0'); // Remaining stakes is zero
    });

    it('Withdraw after close', async function() {
        this.timeout(0);
        await setUpStakes();

        // Now moving to the first moment after maturity
        await festaking.methods.setEarlyWithdrawalPeriod(60000).send({from: owner, gas: GAS});

        const before = await vars();
        const balanceBefore = await balance(ac2);
        assert.deepStrictEqual(before, {
            stakedTotal: '1000',
            totalReward: '1000',
            earlyWithdrawReward: '500',
            rewardBalance: '1000',
            stakedBalance: '1000',
        });
        assert.deepStrictEqual(balanceBefore, '200');

        await festaking.methods.withdraw(400).send({from: ac2, gas: GAS});
        let after = await vars();
        let bal = await balance(ac2);
        let balX = await balanceX(ac2);
        assert.deepStrictEqual(after, {
            stakedTotal: '1000',
            totalReward: '1000',
            earlyWithdrawReward: '500',
            rewardBalance: '1000',
            stakedBalance: '1000',
        });
        assert.deepStrictEqual(bal, (400 + 200).toString()); // reward + amount + existing balance
        assert.deepStrictEqual(balX, (1400).toString()); // reward + amount + existing balance
    });
});
