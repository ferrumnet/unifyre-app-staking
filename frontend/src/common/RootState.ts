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

export interface ContinuationState {
    action: 'stake' | 'unstake';
    selectedStakeEvent?: string;
}

export interface RootState {
    data : {
        connection: { conneted: boolean, error?: string }
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
        continuation: ContinuationState,
    }
}