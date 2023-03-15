import { combineReducers, AnyAction } from "redux";
import { Dashboard } from "../pages/dashboard/Dashboard";
import { GroupInfo as Group } from "../pages/admin/groupInfo/groupinfo";
import { SaerchStakingGroupInfo } from "../pages/admin/stakings/stakings";
import { AdminDash } from "../pages/admin/dashboard/adminDash";
import { CommonActions } from "./Actions";
import { userPreferenceReducer } from "../services/UserPreferenceService";
import {  StakingAppServiceActions } from "../services/StakingAppClient";
import { AppUserProfile } from "unifyre-extension-sdk/dist/client/model/AppUserProfile";
import { StakeToken } from "../pages/stakeToken/StakeToken";
import { UnstakeToken } from "../pages/unstakeToken/UnstakeToken";
import {ConfirmTxn} from '../pages/confirmation/ConfirmTxn'
import { GroupData, StakingDataState } from "./RootState";
import { Utils } from "./Utils";
import { GroupInfo } from "./Types";
import { ConnectorContainer } from "../connect/ConnectContainer";
import { connectSlice } from './../connect/ConnectButtonWrapper';

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

function sortByCreatedAt(objs: {createdAt: number}[]) {
    return objs.sort((o1, o2) => o2.createdAt - o1.createdAt);
}

function stakingData(state: StakingDataState = { contracts: [], stakeEvents: []}, action: AnyAction) {
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
        case StakingAppServiceActions.USER_STAKE_EVENTS_RECEIVED:
            const {stakeEvents} = action.payload;
            return {...state, stakeEvents: sortByCreatedAt(stakeEvents || [])};
        case StakingAppServiceActions.USER_STAKE_EVENTS_UPDATED:
            const {updatedEvents} = action.payload;
            return {...state, stakeEvents: 
                sortByCreatedAt(Utils.union(state.stakeEvents, updatedEvents, e => e.mainTxId))};
        default:
            return state;
    }
}
function groupData(state: GroupData = { info: {} as any }, action: AnyAction): GroupData {
    switch(action.type) {
        case StakingAppServiceActions.GROUP_INFO_LOADED:
            const groupInfo = action.payload as GroupInfo;
            return {...state, info: groupInfo};
        default:
            return state;
    }
}

const data = combineReducers({
    userData: ConnectorContainer.reduceData,
    stakingData,
    userPreference: userPreferenceReducer,
    groupData: groupData,
    account: connectSlice.reducer,
});

const ui = combineReducers({
    flags,
    dashboard: Dashboard.reduce,
    stakeToken: StakeToken.reduce,
    unstakeToken: UnstakeToken.reduce,
    continuation: ConfirmTxn.reduce,
    adminGroupInfo: Group.reduce,
    adminStakings: SaerchStakingGroupInfo.reduce,
    adminDash: AdminDash.reduce,
});

export const rootReducer = combineReducers({ data, ui });
