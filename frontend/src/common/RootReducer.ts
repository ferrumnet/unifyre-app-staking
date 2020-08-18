import { combineReducers, AnyAction } from "redux";
import { Dashboard } from "../pages/dashboard/Dashboard";
import { CommonActions } from "./Actions";
import { userPreferenceReducer } from "../services/UserPreferenceService";
import {  StakingAppServiceActions } from "../services/StakingAppClient";
import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";

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

function userData(state: { userProfile: AppUserProfile } = {} as any, action: AnyAction) {
    switch(action.type) {
        case StakingAppServiceActions.USER_DATA_RECEIVED:
            const {userProfile} = action.payload;
            return {...state, profile: userProfile };
        default:
            return state;
    }
}

function stakingData(state: { userProfile: AppUserProfile } = {} as any, action: AnyAction) {
    switch(action.type) {
        case StakingAppServiceActions.STAKING_DATA_RECEIVED:
            const {stakingData} = action.payload;
            return {...state, stakingData };
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
});

export const rootReducer = combineReducers({ data, ui });
