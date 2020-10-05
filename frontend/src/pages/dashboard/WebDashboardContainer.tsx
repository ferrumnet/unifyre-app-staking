import React, {useEffect} from 'react';
import { Dashboard, DashboardDispatch } from './Dashboard';
import { Switch, Route } from 'react-router-dom';
import {
    Row, ThemedText, Gap, Page,
    // @ts-ignore
} from 'unifyre-web-components';
import {
  Page as WebPages
  // @ts-ignore
} from 'desktop-components-library';
import { Button, Label, Provider, Text , teamsTheme} from '@fluentui/react-northstar';
import { connect } from 'react-redux';
import { CONFIG } from '../../common/IocModule';
import { intl } from 'unifyre-react-helper';
import { DashboardProps } from '../../common/RootState';
import { MainContainer } from '../main/WebMainContainer';
import { StakingContractContainer } from '../stakingContract/StakingContractContainer';
import { StakeTokenContainer as WebStakeToken } from '../stakeToken/WebStakeToken';
import { UnstakeTokenContainer as WebUnStakeToken } from '../unstakeToken/WebUnstakeTokenContainer';
import { UnstakeTokenContainer } from '../unstakeToken/UnstakeTokenContainer';
import {ConfirmTxnContainer} from '../confirmation/ConfirmTxnContainer';
import { PageWrapper } from '../../components/PageWrapper';
import { Utils } from '../../common/Utils';
import { StakingContractContainer as WebStakingContractContainer } from '../stakingContract/Web/index';

function DashboardComponent(props: DashboardProps&DashboardDispatch) {
    const {onLoad} = props;
    useEffect(() => {
        onLoad();
    }, [onLoad]);

    const testAlert = CONFIG.isProd ? undefined : (<><Row withPadding><Text size={'largest'} content={'TEST MODE'}/></Row></>)
    if (props.initialized) {
        // Render the routes
        return (
            <>
            <PageWrapper>
              <Switch>
                  <Route path='/confirm/:transactionId'>
                        <ConfirmTxnContainer/>
                  </Route>
                  <Route path='/unstake/:contractAddress'>
                        <WebUnStakeToken/>
                  </Route>
                  <Route path='/stake/:contractAddress'>
                        <WebStakeToken/>
                  </Route>
                  <Route path='/info/:contractAddress'>
                        <WebStakingContractContainer />
                  </Route>
                  <Route path="/continuation">
                    <ConfirmTxnContainer />
                  </Route>
                  <Route path='/'>
                        {
                          Utils.getQueryparam('continuation') ? 
                            <ConfirmTxnContainer /> : <MainContainer />
                        }
                  </Route>
              </Switch>
            </PageWrapper>
            </>
        );
    }

    const fatalError = props.fatalError ? (
      <>
        <Row withPadding centered>
            <Text size={'larger'} content={'Could not open the app'} />
        </Row>
        <Row withPadding centered>
            <Text size={'medium'} content={props.fatalError} />
        </Row>
      </>
    ) : (
      <Row withPadding centered>
          <ThemedText.H2>Connecting...</ThemedText.H2>
      </Row>
    );

    return (
      <Page>
          {testAlert}
          <Gap />
          <Gap />
          <Gap />
          <Gap />
          {fatalError}
      </Page> 
     
    );
}

export const WebDashboardContainer = connect(
  Dashboard.mapStateToProps, Dashboard.mapDispatchToProps)(DashboardComponent);