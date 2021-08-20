import { AnyAction, Dispatch } from "redux";
import { RootState } from "../../../common/RootState";
import { inject } from "../../../common/IocModule";
import { addAction, CommonActions } from "../../../common/Actions";
import { StakingAppClient } from "../../../services/StakingAppClient";
import { GroupInfo as InfoType} from '../../../common/Types';
import { ValidationUtils } from "ferrum-plumbing";

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
    SELECTED_INFO_CHANGED: 'SELECTED_INFO_CHANGED',
    ERROR: 'ERROR',
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
    infos: InfoType[];
    groupInfos: InfoType[];
    selected: boolean;
    selectedInfo: InfoType;
    originalInfo : InfoType;
    error?: string;
}

function checkEmpty(data: InfoType){
    if( data.groupId  === '' 
        || data.homepage  === '' 
        || data.network === ''
        || data.mainLogo  === ''
    ){
        return true
    }
    return false
}

function isValidJson(j: string): boolean {
	try {
		return !!JSON.parse(j);
	} catch(e) {
		return false;
	}
}

function mapStateToProps(state: RootState): GroupInfoProps {
    return {
        ...state.ui.adminGroupInfo,
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
            const client = inject<StakingAppClient>(StakingAppClient);
            //@ts-ignore
            infos.defaultCurrency = `${infos.network}:${(infos as any)['contractAddress'].toLowerCase()}`
            console.log('About to update gi', infos)
            const res = await client.updateGroupInfos(dispatch,infos);
            if(res){
                cb();
                dispatch(addAction(GroupInfoActions.RETURN,{}))
            }
        } catch (error) {
            dispatch(addAction(GroupInfoActions.ERROR,{ message: error.message }))
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    addGroupInfo: async (infos: InfoType,cb:()=>void) => {        
        try {
            // dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            const client = inject<StakingAppClient>(StakingAppClient);
            //@ts-ignore
            infos.defaultCurrency = `${infos.network}:${infos['contractAddress'].toLowerCase()}`
            const error = checkEmpty(infos);
            ValidationUtils.isTrue(!error, 'A required field is empty' );
            const res = await client.addGroupInfos(dispatch,infos);
            if(res){
                cb();
                dispatch(addAction(GroupInfoActions.RETURN,{}))
            }
        } catch (error) {
            dispatch(addAction(GroupInfoActions.ERROR,{ message: error.message }))
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
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
        network: '',
        _id: '',
        groupId: '', 
        themeVariables: '', 
        defaultCurrency: '',
        homepage: '',
        noMainPage: true
    },
    selectedInfo: {
        network: '',
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

//@ts-ignore
function reduce(state:GroupInfoState = defaultGroupInfoState  , action:AnyAction){
    switch (action.type) {
        case Actions.GROUP_INFOS_FECTHED:
            return {...state, groupInfos: action.payload.data, info: action.payload.data}
        case Actions.INFO_CHANGED:
            return {...state, groupInfos: action.payload.val}
        case Actions.INFO_RESET:
            return {...state, groupInfos: state.info}
        case Actions.INFO_SELECTED:
            return {...state, 
                selectedInfo: {
                    ...action.payload.info,
                    network: action.payload.info.defaultCurrency.split(':')[0] || '',
                    contractAddress: action.payload.info.defaultCurrency.split(':')[1] || '',
                    mainLogo: action.payload.info?.themeVariables?.mainLogo || '',
                    themeVariables: JSON.stringify(action.payload.info?.themeVariables) || ''
                },
                selected: !state.selected, 
                originalInfo: action.payload.info
            }
        case Actions.RETURN: 
            return {...state, selected: !state.selected, selectedInfo: defaultGroupInfoState.selectedInfo,}
        case Actions.SELECTED_INFO_CHANGED:
			let s: any = {...state,selectedInfo: {...state.selectedInfo, [action.payload.field]: action.payload.value},error: ''};
			if (action.payload.field === 'themeVariables') {
				s.error = s.error || (isValidJson(action.payload.value) ? '' : 'Bad JSON');
			}
            return s
        case Actions.ERROR:
            return {...state, error: action.payload.message}
        default:
            return state
    }
}

export const GroupInfo = ({
    mapDispatchToProps,
    mapStateToProps,
    reduce
})