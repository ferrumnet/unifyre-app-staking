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
}

export interface ClaimState {
    error?: string;
}


export interface RootState {
    data : {
        userData: { profile: AppUserProfile },
        userPreference: UserPreference,
    },
    ui: {
        flags: {
            waiting: boolean,
        },
        dashboard: DashboardProps,
    }
}