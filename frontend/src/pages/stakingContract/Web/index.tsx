import React, {useContext} from 'react';
import {
    Page,PageTopPart,  Row, ThemedText, Gap, ThemedButton, ThemedLink, InputGroupAddon,
    // @ts-ignore
} from 'unifyre-web-components';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { StakingContract, StakingContractDispatch, StakingContractProps } from '../StakingContract';
import { LoaderContainer } from '../../../components/Loader';
import { buildStyles,CircularProgressbarWithChildren} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {ThemeContext, Theme} from 'unifyre-react-helper';
import {PreStakingView} from './PreStakingView';
import {WithdrawView} from './WithdrawView';
import {StakingView} from './StakingView';
import { Label } from '@fluentui/react-northstar'

function StakingContractComponent(props: StakingContractProps&StakingContractDispatch) {
    const history = useHistory();
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
                mainPart = (<StakingView {...props}/>);
            break;
    }

    return (
        <Page>
            <div className="mainpage">
                    {/* <PageTopPart>
                    <Row withPadding centered>
                        <ThemedText.H2>{props.contract.name}</ThemedText.H2>
                    </Row>
                    <Gap />
                </PageTopPart> */}
                
                {mainPart}
                <Row withPadding centered>
                    <ThemedLink text={'Go back'} onClick={() => history.replace('/')} />
                </Row>
                <Gap size={'small'}/>
            </div>
            <LoaderContainer />
           
        </Page>
    );
}

export const StakingContractContainer = connect(
    StakingContract.mapStateToProps, StakingContract.mapDispatchToProps)(StakingContractComponent);