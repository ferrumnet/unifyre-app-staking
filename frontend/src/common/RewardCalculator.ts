import { Big } from 'big.js';

function annualize(r: Big, yearMs: number, dT: number) {
    return r.times(new Big(yearMs)).div(dT);
}

export function earlyWithdrawAnnualRate(
  stakedTotal: Big,
  earlyWithdrawReward: Big,
  withdrawEnd: number,
  stakingEnd: number,
): Big {
  if (earlyWithdrawReward.gt(new Big(0))) {
    const dT = withdrawEnd * 1000 - stakingEnd * 1000;
    const yearMs = 365 * 24 * 3600 * 1000;
    const annualRate = annualize(earlyWithdrawReward.div(stakedTotal), yearMs, dT);
    return annualRate;
  }
  return new Big(0);
};

export function maturityAnnualRate(
  stakedTotal: Big,
  totalReward: Big,
  withdrawEnd: number,
  stakingEnd: number,
): Big {
  if (totalReward.lte(new Big(0))) { 
      return new Big(0);
  }
  const dT = withdrawEnd * 1000 - stakingEnd * 1000;
  const yearMs = 365 * 24 * 3600 * 1000;
  const annualRate = annualize(totalReward.div(stakedTotal), yearMs, dT);
  return annualRate;
};

export function minimumRewardMaturity(
  stakedTotal: Big,
  totalReward: Big,
  withdrawEnd: number,
  stakingEnd: number,
): Big {
  if (totalReward.gt(new Big(0))) {
    const dT = (withdrawEnd - stakingEnd) * 1000;
    const yearMs = 365 * 24 * 3600 * 1000;
    const annualRate = annualize(totalReward.div(stakedTotal), yearMs, dT);
    return annualRate;
  }
  return new Big(0);
};

export function calculateReward (
  amount: Big,
  convertedDate: number,
  earlyWithdrawReward: Big,
  totalReward: Big,
  deployedWithdrawEnd: number,
  deployedStakingEnd: number,
  stakedTotal: Big,
  percentEarlyUnstake: number,
) {
  const zero = new Big(0);
  if (amount.eq(zero) || stakedTotal.eq(zero)) {
    return zero;
  }
  if (convertedDate > Number(deployedWithdrawEnd)) {
    const others = stakedTotal.minus(amount).times(new Big(1 - percentEarlyUnstake / 100));
    const remainingReward = totalReward.minus(earlyWithdrawReward)
        .times(new Big(percentEarlyUnstake / 100)).div(new Big(2)); // Averaging early withdraws
    return remainingReward.gt(new Big(0)) ?
      amount.div(amount.plus(others).times(remainingReward)) : new Big(0);
  }
  const earlyRate = earlyWithdrawAnnualRate(
    stakedTotal,
    earlyWithdrawReward,
    deployedWithdrawEnd,
    deployedStakingEnd,
  );
  const yearS = 365 * 24 * 3600;
  return earlyRate.times(new Big((convertedDate - deployedStakingEnd) / yearS).times(amount));
};
