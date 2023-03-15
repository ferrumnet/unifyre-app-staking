import { StakingApp } from "./Types"
import { Utils } from "./Utils"

test('calculate rewards', function() {
    const now = Date.now() / 1000;
    const tomorrow = now + 3600 * 24;
    const dummyApp = {
        stakedTotal: '1000',
        rewardBalance: '100',
        earlyWithdrawReward: '50',
        stakingEnds: now,
        withdrawEnds: tomorrow,
    };
   // const rewards = Utils.stakingRewards(dummyApp);
    //console.log(rewards);
})