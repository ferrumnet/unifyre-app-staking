import React, {useEffect} from 'react';
import { Dashboard, DashboardDispatch, DashboardProps } from './Dashboard';
import { Switch, Route } from 'react-router-dom';
import {
    Row, ThemedText, Gap, Page,
    // @ts-ignore
} from 'unifyre-web-components';
import { connect } from 'react-redux';
import { CONFIG } from '../../common/IocModule';
import { MainContainer } from '../main/MainContainer';
import { StakingContractContainer } from '../stakingContract/StakingContractContainer';
import { StakeTokenContainer } from '../stakeToken/StakeTokenContainer';
import { UnstakeTokenContainer } from '../unstakeToken/UnstakeTokenContainer';
import {ConfirmTxnContainer} from '../confirmation/ConfirmTxnContainer';
import { PageWrapper } from '../../components/PageWrapper';
import { Utils } from '../../common/Utils';
function DashboardComponent(props: DashboardProps&DashboardDispatch) {
    const {onLoad} = props;
    useEffect(() => {
        onLoad();
    }, [onLoad]);

    const testAlert = CONFIG.isProd ? undefined : (<><Row withPadding><ThemedText.H1>TEST MODE</ThemedText.H1></Row></>)
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
                        <UnstakeTokenContainer/>
                  </Route>
                  <Route path='/stake/:contractAddress'>
                        <StakeTokenContainer/>
                  </Route>
                  <Route path='/info/:contractAddress'>
                        <StakingContractContainer />
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
          <ThemedText.H2 >{'Could not open the app'}</ThemedText.H2>
        </Row>
        <Row withPadding centered>
          <ThemedText.H3 >{props.fatalError}</ThemedText.H3>
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

export const DashboardContainer = connect(
  Dashboard.mapStateToProps, Dashboard.mapDispatchToProps)(DashboardComponent);