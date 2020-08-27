import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { StakeEvent, StakingApp, UserStake } from "./Types";

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
    transactionId?: string,
    showConfirmation?: boolean
}

export interface ClaimState {
    error?: string;
}

export interface StakingDataState {
    contracts: StakingApp[];
    stakeEvents: StakeEvent[];
    selectedContract?: StakingApp;
    userStake?: UserStake;
}

export interface RootState {
    data : {
        userData: { profile: AppUserProfile },
        userPreference: UserPreference,
        stakingData: StakingDataState,
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