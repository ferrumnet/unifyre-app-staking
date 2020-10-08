import React from 'react';
import { RootState } from '../common/RootState';
import { connect } from 'react-redux';
import {
    Waiting,
    // @ts-ignore
} from 'desktop-components-library';

interface WaitingProps { waiting: boolean }

function WaitingComponent(props: WaitingProps) {

    return (
        <Waiting show={props.waiting} />
    )
}

function mapStateToProps(state: RootState): WaitingProps {
    return { waiting: state.ui.flags.waiting };
}

export const WebWaitingContainer = connect(mapStateToProps, () => ({}))(WaitingComponent);