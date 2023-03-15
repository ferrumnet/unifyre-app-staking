import React, { useEffect } from 'react';
import {
    Page,
    // @ts-ignore
} from 'unifyre-web-components';
import { connect } from 'react-redux';
import { StakingContract, StakingContractDispatch, StakingContractProps } from '../StakingContract';
import { LoaderContainer } from '../../../components/Loader';
import 'react-circular-progressbar/dist/styles.css';
import {StakingView} from './StakingView';
import { WithdrawView } from './WithdrawView';
import moment from 'moment';

function StakingContractComponent(props: StakingContractProps&StakingContractDispatch) {
    let mainPart = (<> </>);
    switch (props.state) {
        case 'pre-stake':
         case 'stake':
            mainPart = (<StakingView {...props}/>);
            break;
        case 'pre-withdraw':
        case 'maturity':
        case 'withdraw':
                mainPart = (<WithdrawView {...props}/>);
            break;
    }

    useEffect(() => {
        if (props.state === 'pre-stake') {

            setTimeout(() => {
                props.onLoad(props.contract.network, props.contract.contractAddress, props.userAddress)
            }, (moment(props.contract.stakingStarts * 1000).diff(moment(Date.now()))))
        } else if (props.state === 'pre-withdraw') {
            setTimeout(() => {
                props.onLoad(props.contract.network, props.contract.contractAddress, props.userAddress)
            }, (moment(props.contract.withdrawStarts * 1000).diff(moment(Date.now()))))
        }
       
    }, [props])

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