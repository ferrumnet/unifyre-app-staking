import React, {useEffect} from 'react';
import { Dashboard, DashboardDispatch, DashboardProps } from './Dashboard';
import { Switch, Route } from 'react-router-dom';
import {
    Row, ThemedText, Gap, Page,
    // @ts-ignore
} from 'unifyre-web-components';
import { connect } from 'react-redux';
import { CONFIG, IocModule } from '../../common/IocModule';
import { MainContainer } from '../main/MainContainer';
import { StakingContractContainer } from '../stakingContract/StakingContractContainer';
import { StakeTokenContainer } from '../stakeToken/StakeTokenContainer';
import { UnstakeTokenContainer } from '../unstakeToken/UnstakeTokenContainer';
import {ConfirmTxnContainer} from '../confirmation/ConfirmTxnContainer';
import { BackendMode, Utils } from '../../common/Utils';
import { ResponsivePageWrapper } from '../../base/ResponsivePageWrapper';
import { defaultDarkThemeConstantsBuilder, Theme, ThemeConstantProvider } from 'unifyre-react-helper';
function DashboardComponent(props: DashboardProps&DashboardDispatch) {
    const {onLoad} = props;
    useEffect(() => {
        onLoad();
    }, [onLoad]);
    let themeProvider = new ThemeConstantProvider('unifyre', defaultDarkThemeConstantsBuilder
      .set(Theme.Font.main, "'Open Sans', sans-serif")
      .set(Theme.Colors.themeNavBkg, "$Color.bkgShade2")
        .set(Theme.Logo.logo, 'https://staking.ferrum.network/static/media/logo.44e552d9.png')
      .build());  
    const testAlert = CONFIG.isProd ? undefined : (<><Row withPadding><ThemedText.H1>TEST MODE</ThemedText.H1></Row></>)
    if (props.initialized) {
        // Render the routes
        return (
            <>
            <ResponsivePageWrapper
              container={props.initialized ? IocModule.container() : undefined}
              mode={BackendMode.mode}
              theme={themeProvider}
              onConnected={props.onConnected}
              onDisconnected={props.onDisconnected}
              onConnectionFailed={props.onConnectionFailed}
              panelOpen={false}
            >
              <Switch>
                  <Route path='/confirm/:transactionId'>
                        <ConfirmTxnContainer/>
                  </Route>
                  <Route path='/unstake/:contractAddress/:network'>
                        <UnstakeTokenContainer/>
                  </Route>
                  <Route path='/unstake/:contractAddress'>
                        <UnstakeTokenContainer/>
                  </Route>
                  <Route path='/stake/:contractAddress'>
                        <StakeTokenContainer/>
                  </Route>
                  <Route path='/stake/:contractAddress/:network'>
                        <StakeTokenContainer/>
                  </Route>
                  <Route path='/info/:contractAddress/:network'>
                        <StakingContractContainer />
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
            </ResponsivePageWrapper>
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