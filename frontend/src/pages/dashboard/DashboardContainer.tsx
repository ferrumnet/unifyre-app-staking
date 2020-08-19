import React, {useEffect} from 'react';
import { DashboardDispatch, Dashboard } from './Dashboard';
import { Switch, Route, useHistory } from 'react-router-dom';
import {
    Page,PageTopPart,  Row, ThemedText, Gap,InputGroupAddon
    // @ts-ignore
} from 'unifyre-web-components';
import { connect } from 'react-redux';
import { CONFIG } from '../../common/IocModule';
import { Utils } from '../../common/Utils';
import { intl } from 'unifyre-react-helper';
import { StakingComponent } from './../staking/StakingContainer';
import { MainComponent } from './../staking/Main';
import {StakeComponent} from '../staking/StakeTokenPage';
import {UnStakeComponent} from '../staking/Unstake';


function DashboardComponent(props: any) {
    const {onLoad} = props;
    const history = useHistory();
    useEffect(() => {
        onLoad();
    }, [onLoad]);
    const linkId = Utils.getQueryparam('linkId');

    const testAlert = CONFIG.isProd ? undefined : (<><Row withPadding><ThemedText.H1>TEST MODE</ThemedText.H1></Row></>)
    if (props.initialized) {
        // Render the routes
        return (
            <>
              <Switch>
                  <Route path='/unstake/:address'>
                        <UnStakeComponent props={props}/>
                  </Route>
                  <Route path='/stake/:address'>
                        <StakeComponent props={props}/>
                  </Route>
                  <Route path='/info/:address'>
                        <StakingComponent props={props.stakingData}/>
                  </Route>
                  <Route path='/'>
                        <MainComponent props={props.stakingData}/>
                  </Route>
              </Switch>
            </>
        );
    }

    const fatalError = props.fatalError ? (
      <>
        <Row withPadding centered>
          <ThemedText.H2 >{intl('fatal-error-heading')}</ThemedText.H2>
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