import { LocaleManager } from "unifyre-react-helper";
import { RootState } from './RootState';
import { StakingApp, StakeEvent, StakingContractType } from './Types';
import { Big } from 'big.js';
import { calculateReward, earlyWithdrawAnnualRate, maturityAnnualRate } from "./RewardCalculator";
import moment from 'moment';
import * as Sentry from "@sentry/browser";
import { ApplicationMode } from "../base/PageWrapperTypes";

const LOGO_TEMPLATE = 'https://unifyre-metadata-public.s3.us-east-2.amazonaws.com/logos/{NETWORK}/{TOKEN}-white.png';
 
export type StakingState = 'pre-stake' | 'stake' | 'pre-withdraw' | 'withdraw' | 'maturity';

export interface StakingRewards {
    contractType: StakingContractType;
    earlyWithdrawAnnual: string;
    earlyWithdrawSentenceOverwrite?: string;
    maturityAnnual: string;
    maturitySentenceOverwrite?: string;
    maturityMaxAmount: string;
    tokenSymbol: string;
    rewardSybol: string;
    rewardPrice: string;
}

export class BackendMode {
    static mode: ApplicationMode = 'unifyre';
    static app: 'staking' | 'bridge' = 'staking';
}

export function logError(msg: string, err: Error) {
    console.error(msg, err);
    Sentry.captureException(err);
}

export class Utils {
    static getQueryparams(): any {
        const rv: any = {};
        const queryParams = (window.location.href.split('?')[1] || '')?.split('&')?.map(p => p.split('='));
        queryParams.forEach(p => rv[p[0]] = p[1]);
        return rv;
    }

    static getQueryparam(param: string): string | undefined {
        const queryParams = (window.location.href.split('?')[1] || '')?.split('&')?.map(p => p.split('='));
        return (queryParams.find(p => p[0] === param) || [])[1];
    }

    static getRoute(subRoute: string) {
        let base = window.location.href.split('?')[0];
        if (!base.endsWith('/')) {
            base = base + '/';
        }
        return base + subRoute;
    }

    static getGroupIdFromHref() {
        let base = window.location.pathname;
        const parts = base.split('/');
        return parts[1];
    }

    static ellipsis(s: string, len: number) {
        if (s.length <= len) { return s; }
        return `${s.substr(0, len - 3)}...`;
    }

    static strLength(s: string) {
        return s.length
    }

    static shorten(s: string) {
        if (s.length <= 25) { return s; }
        return `${s.substr(0, 10)}...${s.substr(s.length - 10)}`;
    }

    static linkForAddress(network, addr) {
        switch (network.toLocaleLowerCase()) {
            case 'rinkeby':
                return `https://rinkeby.etherscan.io/address/${addr}`;
            case 'ethereum':
                return `https://etherscan.io/address/${addr}`;
            case 'bsc':
                return `https://bscscan.com/address/${addr}`;
            case 'bsc_testnet':
                return `https://testnet.bscscan.com/address/${addr}`;
            case 'mumbai_testnet':
                return `https://mumbai.polygonscan.com/address/${addr}`;
            case 'polygon':
                return `https://polygonscan.com/address/${addr}`;
            case 'avax_testnet':
                return `https://testnet.snowtrace.io/address/${addr}`;
            case 'avax_mainnet':
                return `https://testnet.snowtrace.io/address/${addr}`;
            case 'moon_moonbase':
                return `https://moonbase.moonscan.io/address/${addr}`;
            case 'avax_mainnnet':
                return `https://snowtrace.io/address/${addr}`;
            case 'moon_moonriver':
                return `https://moonriver.moonscan.io/address/${addr}`;
            case 'ftm_testnet':
                return `https://testnet.ftmscan.com/address/${addr}`;
            case 'ftm_mainnet':
                return `https://ftmscan.com/address/${addr}`;
            case 'harmony_testnet_0':
                return `https://explorer.pops.one/address/${addr}`;
            case 'harmony_mainnet_0':
                return `https://explorer.harmony.one/address/${addr}`;
            case 'ftm_mainnet':
                return `https://ftmscan.com/address/${addr}`;
            case 'shiden_testnet':
                return `https://shibuya.subscan.io/address/${addr}`;
            case 'velas_mainnet':
                return `https://evmexplorer.velas.com/address/${addr}`;
            case 'arbitrum_ethereum':
                return `https://arbiscan.io/address/${addr}`;
        }
        return '';
    }

    static linkForTransaction(network, tid) {
        switch (network.toLocaleLowerCase()) {
            case 'rinkeby':
                return `https://rinkeby.etherscan.io/tx/${tid}`;
            case 'ethereum':
                return `https://etherscan.io/tx/${tid}`;
            case 'bsc':
                return `https://bscscan.com/tx/${tid}`;
            case 'bsc_testnet':
                return `https://testnet.bscscan.com/tx/${tid}`;
            case 'mumbai_testnet':
                return `https://mumbai.polygonscan.com/tx/${tid}`;
            case 'polygon':
                return `https://polygonscan.com/tx/${tid}`;
            case 'avax_testnet':
                return `https://testnet.snowtrace.io//tx/${tid}`;
            case 'avax_mainnet':
                return `https://testnet.snowtrace.io//tx/${tid}`;
            case 'moon_moonbase':
                return `https://moonbase.moonscan.io/tx/${tid}`;
            case 'avax_mainnnet':
                return `https://snowtrace.io/tx/${tid}`;
            case 'moon_moonriver':
                return `https://moonriver.moonscan.io/tx/${tid}`;
            case 'ftm_testnet':
                return `https://testnet.ftmscan.com/tx/${tid}`;
            case 'ftm_mainnet':
                return `https://ftmscan.com/tx/${tid}`;
            case 'harmony_testnet_0':
                return `https://explorer.pops.one/tx/${tid}`;
            case 'harmony_mainnet_0':
                return `https://explorer.harmony.one/tx/${tid}`;
            case 'ftm_mainnet':
                return `https://ftmscan.com/tx/${tid}`;
            case 'shiden_testnet':
                 return `https://shibuya.subscan.io/tx/${tid}`;
            case 'velas_mainnet':
                return `https://evmexplorer.velas.com/tx/${tid}`;
            case 'arbitrum_ethereum':
                return `https://arbiscan.io/tx/${tid}`;
        }
        return '';
    }


    static selectedContrat(state: RootState, contractAddress: string): StakingApp | undefined {        
        return state.data.stakingData.contracts.find(c => c.contractAddress ===  contractAddress);
    }

    static selectedTransaction(state: RootState, transactionId: string): StakeEvent | undefined {        
        return state.data.stakingData.stakeEvents.find(c => c.mainTxId ===  transactionId);
    }

    static stakingState(contract?: StakingApp): StakingState {
        if (!contract) {
            return 'pre-stake';
        }
        const now = Date.now() / 1000;
        if (now < contract.stakingStarts) {
            return 'pre-stake';
        }
        if (now < contract.stakingEnds) {
            return 'stake';
        }
        if (now < contract.withdrawStarts) {
            return 'pre-withdraw';
        }
        if (now <= contract.withdrawEnds) {
            return 'withdraw';
        }
        return 'maturity';
    }

    static stakingRewards(contract?: StakingApp): StakingRewards {
        if (!contract || !contract.stakingStarts) {
            return {
                earlyWithdrawAnnual: '0%',
                maturityAnnual: '0%',
                maturityMaxAmount: '0',
                rewardPrice: '',
            } as StakingRewards;
        }
        // Percentage rewards
        const stakingCap = new Big(contract.stakingCap || '0');
        const earlyWithdrawReward = new Big(contract.earlyWithdrawReward || '0');
        const totalReward = new Big(contract.totalReward || '0');
        const price = !!contract.rewardTokenPrice ? new Big(contract.rewardTokenPrice) :
            new Big('1');
        return {
            earlyWithdrawSentenceOverwrite: contract.earlyWithdrawRewardSentence,
            earlyWithdrawAnnual: contract.earlyWithdrawRewardSentence || earlyWithdrawAnnualRate(
                stakingCap,
                earlyWithdrawReward.times(price),
                contract.withdrawEnds,
                contract.stakingEnds).times(100).toFixed(2),
            maturitySentenceOverwrite: contract.totalRewardSentence,
            maturityAnnual: contract.totalRewardSentence || maturityAnnualRate(
                stakingCap,
                totalReward.times(price),
                contract.withdrawEnds,
                contract.stakingEnds,
            ).times(100).toFixed(2),
            maturityMaxAmount: totalReward.toFixed(),
            contractType: contract.contractType,
            rewardSybol: contract.rewardSymbol,
            tokenSymbol: contract.symbol,
            rewardPrice: contract.rewardTokenPrice,
        } as StakingRewards;
    }

    static rewardSentence(annualPct: string, reward: StakingRewards): string {
        if (!!reward.earlyWithdrawSentenceOverwrite && annualPct === reward.earlyWithdrawAnnual) {
            return reward.earlyWithdrawSentenceOverwrite;
        }
        if (!!reward.maturitySentenceOverwrite && annualPct === reward.maturityAnnual) {
            return reward.maturitySentenceOverwrite;
        }
        if (reward.contractType === 'stakeFarming' && !reward.rewardPrice) {
            const rate = formatter.format(new Big(annualPct || '0').div(new Big(100)).toFixed(4), false);
            return `${rate} ${reward.rewardSybol}/${reward.tokenSymbol}`;
        } else {
            return `${annualPct}% APY`;
        }
    }

    static unstakeRewardsAt(contract: StakingApp, stakeOf: string, time: number) {
        if (!contract || !contract.stakingStarts) { return '0'; }
        return calculateReward(
            new Big(stakeOf || '0'),
            time / 1000,
            new Big(contract!.earlyWithdrawReward),
            new Big(contract.totalReward),
            new Big(contract.rewardBalance),
            contract.withdrawEnds,
            contract.stakingEnds,
            new Big(contract.stakedTotal),
            new Big(contract.stakedBalance),
            contract.isLegacy,
        ).toPrecision(6);
    }

    static icon(currency: string): string {
        const parts = currency.split(':');
        return LOGO_TEMPLATE.replace('{NETWORK}', parts[0]).replace('{TOKEN}', parts[1]);
    }

    static stakeProgress(contract: StakingApp): number {
        if (!contract || !contract.stakingEnds) {
            return 0;
        }
        const now = Date.now() / 1000;
        return Math.min(1, (now - contract.stakingStarts) / (contract.stakingEnds - contract.stakingStarts));
    }

    static tillDate(date: number) {
        var endDate = new Date(date * 1000);
        var now = new Date();
      
        var m = moment(endDate);
        const d2 = moment(now);
        var years = m.diff(d2, 'years');
        m.add(-years, 'years');
        var months = m.diff(d2, 'months');
        m.add(-months, 'months');
        var days = m.diff(d2, 'days');
        m.add(-days, 'days');
        var hours = m.diff(d2, 'hours');
        m.add(-hours, 'hours');
        var minutes = m.diff(d2, 'minutes');
        m.add(-minutes, 'minutes');

      
        return [years*12 + months,
          days, hours, minutes];
    }

    static union<T>(a1: T[], a2: T[], keyFun: (v: T) => string): T[] {
        const rv = new Map<string, T>();
        a1.forEach(a => { rv.set(keyFun(a), a); });
        a2.forEach(a => { rv.set(keyFun(a), a); });
        return Array.from(rv.keys()).map(k => rv.get(k)!);
    }

    static parseCurrency(cur: string): [string, string] {
        const pars = cur.split(':', 2);
        return [pars[0], pars[1]];
    }
}

export class CurrencyFormatter {
    unFormat(num: string): string | undefined {
        if (num === '') { return '0';}
        if (!num) return num;
        return LocaleManager.unFormatDecimalString(num);
    }

    format(num: string, isFiat: boolean): string | undefined {
        if (!num) return num;
        const decimals = isFiat ? 2 : 4;
        const canonical = LocaleManager.unFormatDecimalString(num);
        if (!canonical) {
            return;
        }
        return LocaleManager.formatDecimalString(canonical, decimals);
    }
}

export const dataFormat = (data:number) =>  {
    return new Date(Number(data * 1000)).toLocaleString()}

export const dateFromNow = (data:number) => {
    let today = new Date();
    let proposedDate = new Date(Number(data * 1000));
    var timeinmilisec = proposedDate.getTime() - today.getTime() 
    return Math.floor(timeinmilisec / (1000 * 60 * 60 * 24));
}

export const formatter = new CurrencyFormatter();


  export const editableStakingFields = [
    "name", //editable
    "minContribution", //editable
    "maxContribution", //editable
    "emailWhitelist", //editable
    "addressWhitelist", //editable
    "logo",//editable
    "color",//editable
    "backgroundImage",//editable
    "rewardTokenPrice", //editable
    "earlyWithdrawRewardSentence", //editable
    "totalRewardSentence", //editable
    "rewardContinuationParagraph", //editable
    "gasLimitOverride", //editable
  ];

  export const newStaking = [
    "network", //editable
    "contractType", //editable
    "contractAddress", //editable
  ];

  export const stakingFields = [
        "contractType",
        "network",
        "currency",
        "rewardCurrency",
        "groupId",
        "symbol",
        "rewardSymbol",
        "contractAddress",
        "rewardContinuationAddress",
        "rewardContinuationCurrency",
        "rewardContinuationSymbol",
        "tokenAddress",
        "rewardTokenAddress",
        "stakedBalance",
        "rewardBalance",
        "stakingCap",
        "stakedTotal",
        "earlyWithdrawReward",
        "totalReward",
        "withdrawStarts",
        "withdrawEnds",
        "stakingStarts",
        "stakingEnds",
        "backgroundImageDesktop",
        "filled",     
  ];

export const defaultvar = `{"themePrimary": "",
    "themeLighterAlt": "",
    "themeLighter": "",
    "themeLight": "",
    "themeTertiary": "",
    "themeSecondary": "",
    "themeDarkAlt": "",
    "themeDark": "",
    "themeDarker": "",
    "neutralLighterAlt": "",
    "neutralLighter": "",
    "neutralLight": "",
    "neutralQuaternaryAlt": "",
    "neutralQuaternary": "",
    "neutralTertiaryAlt": "",
    "neutralTertiary": "",
    "neutralSecondary": "",
    "neutralPrimaryAlt": "",
    "neutralPrimary": "",
    "neutralDark": "",
    "black": "",
    "white": ""
}`

export const Networks = ['ETHEREUM', 'RINKEBY', 'RINKEBY', 'BSC', 'BSC_TESTNET', 'POLYGON', 'MUMBAI_TESTNET', 'AVAX_TESTNET','AVALANCHE'
,'MOONRIVER', 'HARMONY_TESTNET','HARMONY','FTM_TESTNET','FANTOM','SHIDEN_TESTNET','SHIDEN_MAINNET','FUSE_MAINNET','VELAS_MAINNET', 'ARBITRUM_ETHEREUM']

export const NetworksDropdownValues = [
    {value:'ETHEREUM',"identifier": 'ETHEREUM'}, 
    {value:'RINKEBY',"identifier": 'RINKEBY'}, 
    {value:'BSC',"identifier": 'BSC'}, 
    {value:'BSC_TESTNET',"identifier": 'BSC_TESTNET'}, 
    {value:'POLYGON',"identifier": 'POLYGON'}, 
    {value:'MUMBAI_TESTNET',"identifier": 'MUMBAI_TESTNET'}, 
    {value:'AVAX_TESTNET',"identifier": 'AVAX_TESTNET'}, 
    {value:'AVAX_MAINNET',"identifier": 'AVALANCHE'}, 
    {value:'MOON_MOONRIVER',"identifier": 'MOONRIVER'}, 
    {value:'HARMONY_TESTNET_0',"identifier": 'HARMONY_TESTNET'}, 
    {value:'HARMONY_MAINNET_0',"identifier": 'HARMONY'}, 
    {value:'FTM_TESTNET',"identifier": 'FTM_TESTNET'}, 
    {value:'FTM_MAINNET',"identifier": 'FANTOM'}, 
    {value:'SHIDEN_TESTNET',"identifier": 'SHIDEN_TESTNET'}, 
    {value:'SHIDEN_MAINNET',"identifier": 'SHIDEN'}, 
    {value:'FUSE_MAINNET',"identifier": 'FUSE'},
    {value:'ARBITRUM_ETHEREUM',"identifier": 'ARBITRUM_ETHEREUM'},
//    
]

export const remappedNetwork = (val) => {
   return NetworksDropdownValues.find(e=>(e.identifier === val || e.value === val))
}

export function isLessThan24HourAgo(date) {
    const twentyFourHrInMs = 24 * 60 * 60 * 1000;  
    const twentyFourHoursAgo = Date.now() - twentyFourHrInMs;
    return date > twentyFourHoursAgo;
  }