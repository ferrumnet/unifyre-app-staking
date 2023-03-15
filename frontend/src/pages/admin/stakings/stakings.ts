
import { AnyAction, Dispatch } from "redux";
import { RootState } from "../../../common/RootState";
import { IocModule, inject } from "../../../common/IocModule";
import { addAction, CommonActions } from "../../../common/Actions";
import { StakingAppClient, StakingAppServiceActions } from "../../../services/StakingAppClient";
import { GroupInfo as InfoType, StakingApp} from '../../../common/Types';
import { ConstantProvider } from "unifyre-react-helper";


export interface SaerchStakingGroupInfoState{
    stakings: StakingApp[],
    selected: boolean,
    selectedStaking: StakingApp,
    currency: string,
    groupInfos: InfoType[],
    new: boolean
}

export const SaerchStakingGroupInfoActions = {
    FETCHING_GROUPS_INFOS: 'FETCHING_GROUPS_INFOS',
    STAKING_INFOS_FECTHED : 'STAKING_INFOS_FECTHED',
    GROUP_STAKING_FETCH_FAILED: 'GROUP_STAKING_FETCH_FAILED',
    STAKING_CHANGED: 'STAKING_CHANGED',
    STAKING_RESET:'STAKING_RESET',
    RETURN : 'RETURN',
    STAKING_SELECTED: 'STAKING_SELECTED',
    SELECTED_STAKING_CHANGED: 'SELECTED_STAKING_CHANGED',
    GROUP_INFOS_FECTHED: 'GROUP_INFOS_FECTHED',
    STAKING_INFOS_SAVED: 'STAKING_INFOS_SAVED',
    NEW:'NEW'
}

const Actions = SaerchStakingGroupInfoActions;

export interface SaerchStakingGroupInfoDispatch {
    fetchStakings: (currency: string) => Promise<void>;
    onChangeCurrency: (value: string, infos:InfoType[],w: (c:string)=>void ) => Promise<void>;
    onSelect: (value: Number, infos:StakingApp[]) => void;
    onReturn : () => void;
    onSelectedInfoChange: (v: any,field: string) => void;
    updateGroupInfo: (infos:InfoType,cb:()=>void) => void;
    updateStakings: (staking: StakingApp,cb:()=>void,fp: () =>void) => void;
    deleteStakings: (staking: StakingApp,cb:()=>void,fp: () =>void) => void;
    addNewStakings: (staking: StakingApp,cb:()=>void,fp: () =>void) => void;
    addGroupInfo: (infos:InfoType,cb:()=>void) => void;
    fetchGroups: () => void;
    onNew: () => void;
}

export interface SaerchStakingGroupInfoProps{
    infos: InfoType[]
    groupInfos: InfoType[]
    selected: boolean
    selectedStaking: StakingApp
    currency: string
    stakings: StakingApp[]
    new: boolean
}

function mapStateToProps(state: RootState): SaerchStakingGroupInfoProps {
    return {
        ...state.ui.dashboard,
        infos: state.ui.adminGroupInfo.groupInfos,
        groupInfos: state.ui.adminStakings.groupInfos,
        selected: state.ui.adminStakings.selected,
        selectedStaking: state.ui.adminStakings.selectedStaking,
        currency: state.ui.adminStakings.currency,
        stakings: state.ui.adminStakings.stakings,
        new: state.ui.adminStakings.new
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    fetchGroups: async () => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const client = inject<StakingAppClient>(StakingAppClient);
            const res = await client.getAllGroupInfos(dispatch);
            if(res)
            {                
                dispatch(addAction(SaerchStakingGroupInfoActions.GROUP_INFOS_FECTHED, { data: res }));
            }
        } catch (error) {
            console.log(error);
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    fetchStakings: async (currency: string) => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const client = inject<StakingAppClient>(StakingAppClient);
            const res = await client.getStakingsForToken(dispatch,currency);
            if(res)
            {
                dispatch(addAction(SaerchStakingGroupInfoActions.STAKING_INFOS_FECTHED, { data: res }));
            
            }
        } catch (error) {
            console.log(error);
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    addNewStakings: async (staking: StakingApp,cb:()=>void,fp: () =>void) => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const client = inject<StakingAppClient>(StakingAppClient);
            const res = await client.addNewStakingToGroup(dispatch,staking);
            if(res)
            {
                dispatch(addAction(SaerchStakingGroupInfoActions.STAKING_INFOS_SAVED, { data: res[0] }));
                fp();
                dispatch(addAction(SaerchStakingGroupInfoActions.RETURN,{}))
            }
        } catch (error) {
            console.log(error);
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    updateStakings: async (staking: StakingApp,cb:()=>void,fp: () =>void) => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const client = inject<StakingAppClient>(StakingAppClient);
            delete staking._id
            const res = await client.updateStakingInfo(dispatch,staking);
            if(res)
            {
                dispatch(addAction(SaerchStakingGroupInfoActions.STAKING_INFOS_SAVED, { data: res[0] }));
                fp();
                dispatch(addAction(SaerchStakingGroupInfoActions.RETURN,{}))
            }
        } catch (error) {
            console.log(error);
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    deleteStakings: async (staking: StakingApp,cb:()=>void,fp: () =>void) => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const client = inject<StakingAppClient>(StakingAppClient);
            delete staking._id
            const res = await client.deleteStakingInfo(dispatch,staking);
            if(res)
            {
                dispatch(addAction(SaerchStakingGroupInfoActions.STAKING_INFOS_SAVED, { data: res[0] }));
                fp();
                dispatch(addAction(SaerchStakingGroupInfoActions.RETURN,{}))
            }
        } catch (error) {
            console.log(error);
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    onChangeCurrency: async (val:string,infos: InfoType[],w: (c:string)=>void) => {        
        if(val){
            dispatch(addAction(SaerchStakingGroupInfoActions.STAKING_CHANGED,{val}))
            w(val);
        }else{
            dispatch(addAction(SaerchStakingGroupInfoActions.STAKING_RESET,{val: infos}))
        }
    },
    updateGroupInfo: async (infos: InfoType,cb:()=>void) => {        
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const client = inject<StakingAppClient>(StakingAppClient);
            const res = await client.updateGroupInfos(dispatch,infos);
            if(res){
                cb();
                dispatch(addAction(SaerchStakingGroupInfoActions.RETURN,{}))
            }
        } catch (error) {
            
        }
    },
    addGroupInfo: async (infos: InfoType,cb:()=>void) => {        
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const client = inject<StakingAppClient>(StakingAppClient);
            const res = await client.addGroupInfos(dispatch,infos);
            if(res){
                cb();
                dispatch(addAction(SaerchStakingGroupInfoActions.RETURN,{}))
            }
            dispatch(addAction(SaerchStakingGroupInfoActions.RETURN,{}))
        } catch (error) {
            
        }
    },
    onNew : () => {
        dispatch(addAction(SaerchStakingGroupInfoActions.NEW,{}))
    },
    onReturn : () => {
        dispatch(addAction(SaerchStakingGroupInfoActions.RETURN,{}))
    },
    onSelect: (val:any,infos: StakingApp[]) => {
        dispatch(addAction(SaerchStakingGroupInfoActions.STAKING_SELECTED,{info: infos[val] }))
    },
    onSelectedInfoChange: (val:any,field: string) => {
        dispatch(addAction(SaerchStakingGroupInfoActions.SELECTED_STAKING_CHANGED,{value: val,field: field}))
    },
})

const defaultGroupInfoState = {
    new: false,
    initialized: false,
    stakings: [],
    selected: false,
    currency: '',
    groupInfos: [],
    selectedStaking: {
        _id: undefined,
        contractType: '',
        network: '',
        currency: '',
        rewardCurrency: '',
        groupId: '',
        color: '',
        symbol: '',
        rewardSymbol: '',
        rewardTokenPrice: '',
        contractAddress: '',
        rewardContinuationAddress: '',
        rewardContinuationCurrency: '',
        rewardContinuationSymbol: '',
        minContribution: '',
        maxContribution: '',
        name: '',
        logo: '',
        backgroundImage: '',
        tokenAddress: '',
        rewardTokenAddress: '',
        stakedBalance: '',
        rewardBalance: '',
        stakingCap: '',
        stakedTotal: '',
        earlyWithdrawReward: '',
        earlyWithdrawRewardSentence: '',
        totalReward: '',
        totalRewardSentence: '',
        withdrawStarts: 0,
        withdrawEnds: 0,
        stakingStarts: 0,
        stakingEnds: 0,
    }
}
//@ts-ignore
function reduce(state:SaerchStakingGroupInfoState = defaultGroupInfoState  , action:AnyAction){
    switch (action.type) {
        case Actions.STAKING_INFOS_FECTHED:
            return {...state, stakings: action.payload.data}
        case Actions.GROUP_INFOS_FECTHED:
            return {...state, groupInfos: action.payload.data}
        case Actions.STAKING_CHANGED:
            return {...state, currency: action.payload.val}
        case Actions.STAKING_RESET:
            return {...state, groupInfos: action.payload.val}
        case Actions.STAKING_SELECTED:
            return {...state, selectedStaking: action.payload.info,selected: !state.selected, new: false }
        case Actions.STAKING_INFOS_SAVED:
            return {...state}
        case Actions.NEW: 
            return {...state, selected: !state.selected, new: !state.new }
        case Actions.RETURN: 
            return {...state, selected: !state.selected, selectedStaking: defaultGroupInfoState.selectedStaking, new: false }
        case Actions.SELECTED_STAKING_CHANGED:
            return {...state, selectedStaking: {...state.selectedStaking,currency: state.currency,[action.payload.field]: action.payload.value}}
        default:
            return state
    }
}

export const SaerchStakingGroupInfo = ({
    mapDispatchToProps,
    mapStateToProps,
    reduce
})