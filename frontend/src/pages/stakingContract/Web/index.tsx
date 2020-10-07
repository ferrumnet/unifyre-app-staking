import React from 'react';
import {
    Page,
    // @ts-ignore
} from 'unifyre-web-components';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { StakingContract, StakingContractDispatch, StakingContractProps } from '../StakingContract';
import { LoaderContainer } from '../../../components/Loader';
import 'react-circular-progressbar/dist/styles.css';
import {PreStakingView} from './PreStakingView';
import {StakingView} from './StakingView';
import { WithdrawView } from './WithdrawView';

function StakingContractComponent(props: StakingContractProps&StakingContractDispatch) {
    console.log('STAKOO CONTRACTAR', props);
    let mainPart = (<> </>);
    switch (props.state) {
        case 'pre-stake':
            mainPart = (<PreStakingView {...props}/>);
            break;
         case 'stake':
                mainPart = (<StakingView {...props}/>);
             break;
        case 'pre-withdraw':
        case 'maturity':
        case 'withdraw':
                mainPart = (<WithdrawView {...props}/>);
            break;
    }

    return (
        <Page>
            <LoaderContainer />
            <div className="mainpage">
                {mainPart}
            </div>
        </Page>
    );
}

export const StakingContractContainer = connect(
    StakingContract.mapStateToProps, StakingContract.mapDispatchToProps)(StakingContractComponent);