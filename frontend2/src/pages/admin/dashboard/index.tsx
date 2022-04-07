import React,{ useEffect } from 'react';
import { useHistory } from 'react-router';
import './dash.scss';
import {AdminDash,adminDashDispatch,adminDashProps} from './adminDash'
import { connect } from 'react-redux';

function AdminDashboard(props: adminDashDispatch&adminDashProps){
    const history = useHistory();
    useEffect(() => { props.checkToken().catch(console.error);
            return (() => { });
         }, []);
    return (
        <div >
            <div className="admin-content">
                <div className="category-tab" onClick={()=>history.push('/admin/staking')}>
                    staking
                </div>
                <div className="category-tab" onClick={()=>history.push('/admin/groupinfo')}>
                    Group Info
                </div>
            </div>
            <div className="bod" onClick={()=>props.signOut(history)}>Sign Out</div>
        </div>
    )
}

export const AdminDashContainer = connect(
    AdminDash.mapStateToProps,AdminDash.mapDispatchToProps
)(AdminDashboard);