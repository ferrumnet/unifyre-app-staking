import { combineReducers, AnyAction } from "redux";
import { Dashboard } from "../pages/dashboard/Dashboard";
import { CommonActions } from "./Actions";
import { userPreferenceReducer } from "../services/UserPreferenceService";
import {  StakingAppServiceActions } from "../services/StakingAppClient";
import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { StakeToken } from "../pages/stakeToken/StakeToken";
import { UnstakeToken } from "../pages/unstakeToken/UnstakeToken";
import { StakingDataState } from "./RootState";

function flags(state: { waiting: boolean } = { waiting: false }, action: AnyAction) {
    switch (action.type) {
        case CommonActions.WAITING:
            return { waiting: true };
        case CommonActions.WAITING_DONE:
            return { waiting: false };
        default:
            return state;
    }
}

function userData(state: { profile: AppUserProfile } = {} as any, action: AnyAction) {
    switch(action.type) {
        case StakingAppServiceActions.USER_DATA_RECEIVED:
            const {userProfile} = action.payload;
            return {...state, profile: userProfile };
        default:
            return state;
    }
}

function stakingData(state: StakingDataState = { contracts: []}, action: AnyAction) {
    switch(action.type) {
        case StakingAppServiceActions.STAKING_DATA_RECEIVED:
            const {stakingData} = action.payload;
            return {...state, contracts: stakingData };
        case StakingAppServiceActions.STAKING_CONTACT_RECEIVED:
            const {stakingContract: selectedContract} = action.payload;
            return {...state, selectedContract};
        case StakingAppServiceActions.USER_STAKE_RECEIVED:
            const {userStake} = action.payload;
            return {...state, userStake};
        default:
            return state;
    }
}

const data = combineReducers({
    userData,
    stakingData,
    userPreference: userPreferenceReducer,
});

const ui = combineReducers({
    flags,
    dashboard: Dashboard.reduce,
    stakeToken: StakeToken.reduce,
    unstakeToken: UnstakeToken.reduce,
});

export const rootReducer = combineReducers({ data, ui });
