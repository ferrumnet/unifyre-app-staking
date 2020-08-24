import { LocaleManager } from "unifyre-react-helper";
import { RootState } from './RootState';
import { StakingApp } from './Types';

const LOGO_TEMPLATE = 'https://unifyre-metadata-public.s3.us-east-2.amazonaws.com/logos/{NETWORK}/{TOKEN}-white.png';
 
export type StakingState = 'pre-stake' | 'stake' | 'pre-withdraw' | 'withdraw' | 'maturity';

export class Utils {
    static getQueryparam(param: string): string | undefined {
        const queryParams = (window.location.href.split('?')[1] || '').split('&').map(p => p.split('='));
        return (queryParams.find(p => p[0] === param) || [])[1];
    }

    static getRoute(subRoute: string) {
        let base = window.location.href.split('?')[0];
        if (!base.endsWith('/')) {
            base = base + '/';
        }
        return base + subRoute;
    }

    static platform(): 'desktop' | 'iOS' | 'android' {
        var iOs = /Phone|iPad|iPod/i.test(navigator.userAgent);
        var android = /Android/i.test(navigator.userAgent);
        if (iOs) { return 'iOS'; };
        if (android) { return 'android'; };
        return 'desktop';
    }

    static shorten(s: string) {
        if (s.length <= 25) { return s; }
        return `${s.substr(0, 10)}...${s.substr(s.length - 10)}`;
    }

    static linkForAddress(network: string, addr: string) {
        return  (network === 'RINKEBY') ?
            `https://rinkeby.etherscan.io/address/${addr}` :
            `https://etherscan.io/address/${addr}`;
    }

    static linkForTransaction(network: string, tid: string) {
        return  (network === 'RINKEBY') ?
            `https://rinkeby.etherscan.io/tx/${tid}` :
            `https://etherscan.io/tx/${tid}`;
    }

    static selectedContrat(state: RootState, contractAddress: string): StakingApp | undefined {
        return state.data.stakingData.contracts.find(c => c.contractAddress ===  contractAddress);
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
}

export class CurrencyFormatter {
    unFormat(num: string): string | undefined {
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

    icon(currency: string): string {
        const parts = currency.split(':');
        return LOGO_TEMPLATE.replace('{NETWORk}', parts[0]).replace('{TOKEN}', parts[1]);
    }
}

export const dataFormat = (data:number) =>  {
    return new Date(Number(data * 1000)).toLocaleString()}

export const formatter = new CurrencyFormatter();
