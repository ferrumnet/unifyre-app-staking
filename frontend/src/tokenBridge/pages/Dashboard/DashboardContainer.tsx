import React, {useEffect} from 'react';
import {useHistory} from 'react-router';
import { Dashboard, DashboardDispatch, DashboardProps } from './Dashboard';
import { Switch, Route } from 'react-router-dom';
import {
    Row, ThemedText, Gap, Page,
    // @ts-ignore
} from 'unifyre-web-components';
import { Text } from '@fluentui/react-northstar';
import { connect } from 'react-redux';
import { CONFIG, IocModule } from '../../../common/IocModule';
import { Theme,defaultDarkThemeConstantsBuilder, ThemeConstantProvider, WebdefaultDarkThemeConstantsBuilder } from 'unifyre-react-helper';
import { BackendMode } from '../../../common/Utils';
import { WebWaitingContainer } from '../../../components/WebWaiting';
import { MainContainer } from '../main/mainContainer';
import { SwapContainer } from '../swap/swapContainer';
import { LiquidityContainer } from '../liquidity/liquidityContainer';
import { WebPageWrapper } from '../../../components/WebPageWrapper';
import './../../app.scss'
import { DummyBridgeContainer } from '../../../pages/dummy/TempBridge';
import { useToasts } from 'react-toast-notifications';

function DashboardComponent(props: DashboardProps&DashboardDispatch) {
    const {onBridgeLoad, fatalError} = props;
    const history = useHistory();


    useEffect(() => {
      // Prevent infinite loop if onLoad causes error
        onBridgeLoad().catch(console.error);
    }, [fatalError]);

    let themeProvider = new ThemeConstantProvider('unifyre', defaultDarkThemeConstantsBuilder
      .set(Theme.Font.main, "'Open Sans', sans-serif")
      .set(Theme.Colors.themeNavBkg, "$Color.bkgShade2")
    .set(Theme.Logo.logo, 'https://staking.ferrum.network/static/media/logo.44e552d9.png')
      .build()); 
    const testAlert = CONFIG.isProd ? undefined : (
      <><Row withPadding><Text size={'largest'} content={'TEST MODE'}/></Row></>)
    if (props.initialized) {
        console.log(props,'====props');
      
        // Render the routes
        return (
            <>
            <WebPageWrapper
              mode={BackendMode.mode}
              theme={themeProvider}
              onConnected={props.onConnected}
              onDisconnected={props.onDisconnected}
              onConnectionFailed={props.onConnectionFailed}
              container={props.initialized ? IocModule.container() : undefined}
              authError={props.error}
              isBridgeHome={!(props.initialised && (props.connected || props.isPaired))}
              isBridge
              >
                 <Switch>
                        <Route path='/bridge'>
                          <DummyBridgeContainer onConnected={props.onConnected}/>
                        </Route>
                        <Route path='/liquidity'>
                            <LiquidityContainer/>
                        </Route>
                        <Route path='/swap'>
                            <SwapContainer/>
                        </Route> 
                        <Route path='/'>
                            <MainContainer
                                con={props.onClear}
                                onErr={props.onError}
                            />
                        </Route>
                    </Switch>
              <WebWaitingContainer />
            </WebPageWrapper>
            </>
        );
    }

    const fatalErrorComp = fatalError ? (
      <>
        <Row withPadding centered>
            <Text size={'larger'} content={'Could not open the app'} />
        </Row>
        <Row withPadding centered>
            <Text size={'medium'} content={fatalError} />
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
          {fatalErrorComp}
      </Page> 
     
    );
}

export const DashboardContainer = connect(
  Dashboard.mapStateToProps, Dashboard.mapDispatchToProps)(DashboardComponent);
