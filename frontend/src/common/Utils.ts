import { LocaleManager } from "unifyre-react-helper";
import { RootState } from './RootState';
import { StakingApp } from './Types';

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
}

export const dataFormat = (data:number) =>  {
    return new Date(Number(data * 1000)).toLocaleString()}

export const formatter = new CurrencyFormatter();
