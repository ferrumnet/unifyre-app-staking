import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { StakingApp } from "./Types";

export interface UserPreference {
    lastRedirectLink?: string;
    lastSuccessMessage?: string;
}

export const defaultUserPreference = {
} as UserPreference;

export interface DashboardProps {
    initialized: boolean;
    fatalError?: string;
}

export interface StakeTokenState {
    error?: string;
    amount: string;
}

export interface ClaimState {
    error?: string;
}

export interface RootState {
    data : {
        userData: { profile: AppUserProfile },
        userPreference: UserPreference,
        stakingData: {contracts: StakingApp[], selected?: string },
    },
    ui: {
        flags: {
            waiting: boolean,
        },
        dashboard: DashboardProps,
        stakeToken: StakeTokenState,
        unstakeToken: StakeTokenState,
    }
}