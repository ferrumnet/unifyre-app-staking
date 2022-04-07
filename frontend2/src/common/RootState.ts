import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { GroupInfo, StakeEvent, StakingApp, UserStake } from "./Types";
import { GroupInfoState } from '../pages/admin/groupInfo/groupinfo';
import { SaerchStakingGroupInfoState } from '../pages/admin/stakings/stakings';
import { adminDashState as AdminDashState } from '../pages/admin/dashboard/adminDash';

export interface UserPreference {
    lastRedirectLink?: string;
    lastSuccessMessage?: string;
}

export const defaultUserPreference = {
} as UserPreference;

export interface DashboardState {
    initialized: boolean;
    fatalError?: string;
    connectError?: string;
    isHome?: boolean;
    error?: string;
    userWithdrawalItems?: any[]
}

export interface BridgeDashboardState {
    initialized: boolean;
    fatalError?: string;
    connectError?: string;
    isHome?: boolean;
    error?: string;
    panelOpen: boolean;
    userWithdrawalItems?: any[]
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
    error?: string;
}

export interface GroupData {
    info: GroupInfo,
}

export interface RootState {
    data : {
        userData: { profile: AppUserProfile },
        userPreference: UserPreference,
        stakingData: StakingDataState,
        groupData: GroupData,
    },
    ui: {
        flags: {
            waiting: boolean,
        },
        dashboard: DashboardState,
        bridgeDashboard: BridgeDashboardState,
        stakeToken: StakeTokenState,
        unstakeToken: StakeTokenState,
        continuation: ContinuationState,
        adminGroupInfo: GroupInfoState
        adminStakings: SaerchStakingGroupInfoState,
        adminDash: AdminDashState
    }
}