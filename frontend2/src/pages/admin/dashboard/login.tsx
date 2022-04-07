import React,{} from 'react';
import { useHistory } from 'react-router';
import './dash.scss';
import {AdminDash,adminDashDispatch,adminDashProps,adminDashState} from './adminDash'
import { connect } from 'react-redux';
import { Text } from '@fluentui/react-northstar';

import { PrimaryButton, TextField, values } from '@fluentui/react';
import {
    Gap,Row
    // @ts-ignore
} from 'unifyre-web-components';

function LoginDashboard(props: adminDashDispatch&adminDashProps){
    const history = useHistory();
    return (
        <div className="login-content">
            <TextField
                placeholder={'Enter admin secret to log in'}
                type='password'
                onChange={(e,v)=>props.onChangeSecret(v||'')}
            />
            <Gap/>
            <Row withPadding centered>
                <Text size={'medium'} content={props.error} />
            </Row>
            <PrimaryButton onClick={()=>props.signIn(props.secret,history as any)}>Admin Log In</PrimaryButton>

        </div>
    )
}

export const LoginContainer = connect(
    AdminDash.mapStateToProps,AdminDash.mapDispatchToProps
)(LoginDashboard);