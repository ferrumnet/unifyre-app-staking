import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";

export interface UserPreference {
    lastRedirectLink?: string;
    lastSuccessMessage?: string;
}

export const defaultUserPreference = {
} as UserPreference;

export interface DashboardProps {
    initialized: boolean;
    fatalError?: string;
    stakingData?: any;
    balance?: string;
    address?: any
}

export interface ClaimState {
    error?: string;
}


export interface RootState {
    data : {
        userData: { profile: AppUserProfile },
        userPreference: UserPreference,
        stakingData: any
    },
    ui: {
        flags: {
            waiting: boolean,
        },
        dashboard: DashboardProps,
    }
}