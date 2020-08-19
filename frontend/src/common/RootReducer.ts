import { combineReducers, AnyAction } from "redux";
import { Dashboard } from "../pages/dashboard/Dashboard";
import { CommonActions } from "./Actions";
import { userPreferenceReducer } from "../services/UserPreferenceService";
import {  StakingAppServiceActions } from "../services/StakingAppClient";
import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { StakingApp } from "./Types";
import { StakeToken } from "../pages/stakeToken/StakeToken";
import { UnstakeToken } from "../pages/unstakeToken/UnstakeToken";

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

function stakingData(state: { contracts: StakingApp[], selected?: string } = { contracts: []}, action: AnyAction) {
    switch(action.type) {
        case StakingAppServiceActions.STAKING_DATA_RECEIVED:
            const {stakingData} = action.payload;
            return {...state, contracts: stakingData };
        case StakingAppServiceActions.CONTRACT_SELECTED:
            const {address} = action.payload;
            return {...state, address};
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
