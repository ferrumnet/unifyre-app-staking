import { AnyAction, Dispatch } from "redux";
import { RootState } from "../../../common/RootState";
import { IocModule, inject } from "../../../common/IocModule";
import { addAction, CommonActions } from "../../../common/Actions";
import { StakingAppClient, StakingAppServiceActions } from "../../../services/StakingAppClient";
import { GroupInfo as InfoType} from '../../../common/Types';

export interface GroupInfoState{
    groupInfos: InfoType[],
    info: InfoType[],
    selected: boolean,
    selectedInfo : InfoType,
    originalInfo : InfoType,
}

export const GroupInfoActions = {
    FETCHING_GROUPS_INFOS: 'FETCHING_GROUPS_INFOS',
    GROUP_INFOS_FECTHED : 'GROUP_INFOS_FECTHED',
    GROUP_INFO_FETCH_FAILED: 'GROUP_INFO_FETCH_FAILED',
    INFO_CHANGED: 'INFO_CHANGED',
    INFO_RESET:'INFO_RESET',
    RETURN : 'RETURN',
    INFO_SELECTED: 'INFO_SELECTED',
    SELECTED_INFO_CHANGED: 'SELECTED_INFO_CHANGED'
}

const Actions = GroupInfoActions;

export interface GroupInfoDispatch {
    fetchGroups: () => Promise<void>;
    onChangeGroupInfo: (value: string, infos:InfoType[] ) => Promise<void>;
    onSelect: (value: Number, infos:InfoType[]) => void;
    onReturn : (cb:()=>void) => void;
    onSelectedInfoChange: (v: any,field: string) => void;
    updateGroupInfo: (infos:InfoType,cb:()=>void) => void;
    addGroupInfo: (infos:InfoType,cb:()=>void) => void;
}

export interface GroupInfoProps{
    infos: InfoType[]
    groupInfos: InfoType[]
    selected: boolean
    selectedInfo: InfoType
    originalInfo : InfoType
}


function mapStateToProps(state: RootState): GroupInfoProps {
    return {
        ...state.ui.dashboard,
        infos: state.ui.adminGroupInfo.groupInfos,
        groupInfos: state.ui.adminGroupInfo.groupInfos,
        selected: state.ui.adminGroupInfo.selected,
        selectedInfo: state.ui.adminGroupInfo.selectedInfo || {},
        originalInfo : state.ui.adminGroupInfo.originalInfo || {}
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
                dispatch(addAction(GroupInfoActions.GROUP_INFOS_FECTHED, { data: res }));
            }
        } catch (error) {
            console.log(error);
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    onChangeGroupInfo: async (val:string,infos: InfoType[]) => {        
        if(val){
            dispatch(addAction(GroupInfoActions.INFO_CHANGED,{val: infos.filter((e) => e.groupId.includes(val))}))
        }else{
            dispatch(addAction(GroupInfoActions.INFO_RESET,{val: infos}))
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
                dispatch(addAction(GroupInfoActions.RETURN,{}))
            }
        } catch (error) {
            
        }
    },
    addGroupInfo: async (infos: InfoType,cb:()=>void) => {        
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const client = inject<StakingAppClient>(StakingAppClient);
            infos.themeVariables["mainLogo"] = infos.mainLogo;
            //@ts-ignore
            infos.defaultCurrency = `${infos['Network']}:${infos['contractAddress']}`
            const res = await client.addGroupInfos(dispatch,infos);
            if(res){
                cb();
                dispatch(addAction(GroupInfoActions.RETURN,{}))
            }
            dispatch(addAction(GroupInfoActions.RETURN,{}))
        } catch (error) {
            
        }
    },
    onReturn : (cb:()=>void) => {
        dispatch(addAction(GroupInfoActions.RETURN,{}))
        cb();
    },
    onSelect: (val:any,infos: InfoType[]) => {
        dispatch(addAction(GroupInfoActions.INFO_SELECTED,{info: infos[val] }))
    },
    onSelectedInfoChange: (val:any,field: string) => {

        dispatch(addAction(GroupInfoActions.SELECTED_INFO_CHANGED,{value: val,field: field}))
    },
})

const defaultGroupInfoState = {
    initialized: false,
    groupInfos: [],
    info: [],
    selected: false,
    originalInfo:{
        _id: '',
        groupId: '', 
        themeVariables: '', 
        defaultCurrency: '',
        homepage: '',
        noMainPage: true
    },
    selectedInfo: {
        _id: '',
        groupId: '', 
        themeVariables: '', 
        defaultCurrency: '',
        Network:'',
        contractAddress: '',
        homepage: '',
        noMainPage: true
    }
}

function reduce(state:GroupInfoState = defaultGroupInfoState  , action:AnyAction){
    switch (action.type) {
        case Actions.GROUP_INFOS_FECTHED:
            return {...state, groupInfos: action.payload.data, info: action.payload.data}
        case Actions.INFO_CHANGED:
            return {...state, groupInfos: action.payload.val}
        case Actions.INFO_RESET:
            return {...state, groupInfos: state.info}
        case Actions.INFO_SELECTED:
            return {...state, selectedInfo: action.payload.info,selected: !state.selected, originalInfo: action.payload.info}
        case Actions.RETURN: 
            return {...state, selected: !state.selected, selectedInfo: defaultGroupInfoState.selectedInfo,}
        case Actions.SELECTED_INFO_CHANGED:
            return {...state,selectedInfo: {...state.selectedInfo,[action.payload.field]: action.payload.value}}
        default:
            return state
    }
}

export const GroupInfo = ({
    mapDispatchToProps,
    mapStateToProps,
    reduce
})