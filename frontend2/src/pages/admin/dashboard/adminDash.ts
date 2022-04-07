import { AnyAction, Dispatch } from "redux";
import { RootState } from "../../../common/RootState";
import { IocModule, inject } from "../../../common/IocModule";
import { addAction, CommonActions } from "../../../common/Actions";
import { StakingAppClient } from "../../../services/StakingAppClient";

export interface adminDashState{
    secret: string,
    error: string
}

export const adminDashActions = {
    FETCHING_GROUPS_INFOS: 'FETCHING_GROUPS_INFOS',
    GROUP_INFOS_FECTHED : 'GROUP_INFOS_FECTHED',
    GROUP_INFO_FETCH_FAILED: 'GROUP_INFO_FETCH_FAILED',
    SECRET_CHANGED: 'SECRET_CHANGED',
    INFO_RESET:'INFO_RESET',
    RETURN : 'RETURN',
    INFO_SELECTED: 'INFO_SELECTED',
    ERROR_OCCURED:'ERROR_OCCURED',
    SELECTED_INFO_CHANGED: 'SELECTED_INFO_CHANGED'
}

const Actions = adminDashActions;

export interface adminDashDispatch {
    checkToken: () => Promise<void>;
    signIn: (secret:string, h: any) => Promise<void>;
    onChangeSecret: (secret:string) => void;
    signOut: (h: any) => any;
}

export interface adminDashProps{
    secret: string,
    error: string
}


function mapStateToProps(state: RootState): adminDashProps {
    return {
        ...state.ui.dashboard,
        secret: state.ui.adminDash.secret,
        error: state.ui.adminDash.error
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    checkToken: async () => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const client = inject<StakingAppClient>(StakingAppClient);
            const res = await client.checkAdminToken(dispatch);
        } catch (error) {
            console.log(error);
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
        
    },
    signIn: async (secret:string, h: any) => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const client = inject<StakingAppClient>(StakingAppClient);
            const res = await client.signInAdmin(dispatch,secret);
            if(res){
                h.push('/admin');
                h.go(0);
                return
            }
            dispatch(addAction(adminDashActions.ERROR_OCCURED,{value: 'Wrong password entered, Try again'}))
            return
        }catch (error) {
            console.log(error);
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    },
    onChangeSecret: (secret:string) => {
        dispatch(addAction(adminDashActions.SECRET_CHANGED,{value: secret}))
    },
    signOut: async (h: any) => {
        try {
            dispatch(addAction(CommonActions.WAITING, { source: 'dashboard' }));
            await IocModule.init(dispatch);
            const client = inject<StakingAppClient>(StakingAppClient);
            await client.signOut(dispatch);
            h.push('/admin');
            h.go(0);
            return;
        }catch (error) {
            console.log(error);
        } finally {
            dispatch(addAction(CommonActions.WAITING_DONE, { source: 'dashboard' }));
        }
    }
})

const defaultGroupInfoState = {
    secret: '',
    error: ''
}

function reduce(state:adminDashState = defaultGroupInfoState  , action:AnyAction){
    switch (action.type) {
        case adminDashActions.SECRET_CHANGED:
            return {...state,secret: action.payload.value,error:''}
        case adminDashActions.ERROR_OCCURED:
            return {...state,error: action.payload.value}
        default:
            return state
    }
}

export const AdminDash = ({
    mapDispatchToProps,
    mapStateToProps,
    reduce
})