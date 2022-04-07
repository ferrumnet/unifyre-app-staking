//@ts-nocheck
import { Container } from "ferrum-plumbing";
import { AddressDetails, AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import {IocModule} from './../common/IocModule';

export const dummyAppUserProfile = {
    id: '',
    accountGroups: [ {
        addresses: [],
    }],
} as any as AppUserProfile;

export function addressForUser(user?: AppUserProfile) {
    if (!user) { return undefined; }
    return (user.accountGroups || [])[0].addresses[0] || {};
}

export function addressesForUser(user?: AppUserProfile): AddressDetails[] {
    if (!user) { return []; }
    return (user.accountGroups || [])[0].addresses || [];
}

export const BRIDGE_NETWORKS = ['ETHEREUM', 'RINKEBY', 'RINKEBY', 'BSC', 'BSC_TESTNET', 'POLYGON', 'MUMBAI_TESTNET', 'AVAX_TESTNET','AVAX_MAINNET'
 ,'MOON_MOONRIVER', 'HARMONY_TESTNET_0','HARMONY_MAINNET_0','FTM_TESTNET','FTM_MAINNET','SHIDEN_TESTNET'];


function injectMany(...args: any[]): any[] {
    return args.map(t => IocModule.container().get(t)) as any;
}

export function inject<T1>(...args: any[]): T1 {
    return (injectMany(...args) as any)[0];
}

export function inject2<T1, T2>(...args: any[]): [T1, T2] {
    return injectMany(...args) as any;
}

export function inject3<T1, T2, T3>(...args: any[]): [T1, T2, T3] {
    return injectMany(...args) as any;
}

export function inject4<T1, T2, T3, T4>(...args: any[]): [T1, T2, T3, T4] {
    return injectMany(...args) as any;
}

export function inject5<T1, T2, T3, T4, T5>(...args: any[]): [T1, T2, T3, T4, T5] {
    return injectMany(...args) as any;
}