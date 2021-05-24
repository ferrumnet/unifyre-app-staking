import React, {useEffect} from 'react';
import { Dashboard, DashboardDispatch, DashboardProps } from './Dashboard';
import { Switch, Route } from 'react-router-dom';
import {
    Row, ThemedText, Gap, Page,
    // @ts-ignore
} from 'unifyre-web-components';
import { Text } from '@fluentui/react-northstar';
import { connect } from 'react-redux';
import { Theme as FulentTheme, useTheme } from '@fluentui/react-theme-provider';
import { CONFIG, IocModule } from '../../../common/IocModule';
import { Theme, ThemeConstantProvider, WebdefaultDarkThemeConstantsBuilder } from 'unifyre-react-helper';
import { BackendMode } from '../../../common/Utils';
import { WebWaitingContainer } from '../../../components/WebWaiting';
import { MainContainer } from '../main/mainContainer';
import { SwapContainer } from '../swap/swapContainer';
import { LiquidityContainer } from '../liquidity/liquidityContainer';
import { WebPageWrapper } from '../../../components/WebPageWrapper';
import './../../app.scss'
import { DummyBridgeContainer } from '../../../pages/dummy/TempBridge';

function _loadTheme(themeVariables: FulentTheme, customTheme: any) {
  const themeConstants = WebdefaultDarkThemeConstantsBuilder(themeVariables)
    .set(Theme.Colors.bkgShade0, themeVariables.semanticColors.bodyBackground)
    .set(Theme.Colors.bkgShade1, themeVariables.palette.neutralLight)
    .set(Theme.Colors.bkgShade2, themeVariables.palette.neutralLighter)
    .set(Theme.Colors.bkgShade3, themeVariables.palette.neutralQuaternary)
    .set(Theme.Colors.bkgShade4, themeVariables.palette.neutralTertiary)
    .set(Theme.Colors.textColor, themeVariables.semanticColors.bodyText)
    .set(Theme.Colors.themeNavBkg, themeVariables.semanticColors.bodyStandoutBackground)
    .set(Theme.Spaces.line, themeVariables.spacing.l1)
    .set(Theme.Spaces.screenMarginHorizontal, themeVariables.spacing.s2)
    .set(Theme.Spaces.screenMarginVertical, themeVariables.spacing.s2)
    .set(Theme.Spaces.gap, themeVariables.spacing.l1)
    .set(Theme.Text.pSize, themeVariables.fonts.small.fontSize as number)
    .set(Theme.Text.h1Size, themeVariables.fonts.xLarge.fontSize as number)
    .set(Theme.Text.h2Size, themeVariables.fonts.large.fontSize as number)
    .set(Theme.Text.h3Size, themeVariables.fonts.medium.fontSize as number)
    .set(Theme.Text.h4Size, themeVariables.fonts.smallPlus.fontSize as number)
    .set(Theme.Text.linkColor, themeVariables.semanticColors.actionLink)
    .set(Theme.Text.numberDownColor, themeVariables.semanticColors.errorText)
    .set(Theme.Font.main, themeVariables.fonts.medium.fontFamily! as string)
    .set(Theme.Input.inputTextColor, themeVariables.semanticColors.inputText)
    .set(Theme.Input.inputBackground, themeVariables.semanticColors.inputBackground)
    .set(Theme.Input.inputTextSize, themeVariables.fonts.medium.fontSize as number)
    .set(Theme.Button.btnPrimary, themeVariables.semanticColors.primaryButtonBackground)
    .set(Theme.Button.btnPrimaryTextColor, themeVariables.semanticColors.primaryButtonText)
    .set(Theme.Button.btnBorderRadius, themeVariables.spacing.s2)
    .set(Theme.Button.btnPadding, themeVariables.spacing.s1)
    .set(Theme.Button.btnHighlight, themeVariables.semanticColors.primaryButtonBackground)
    .set(Theme.Button.btnHighlightTextColor, themeVariables.semanticColors.primaryButtonText)
    .set(Theme.Button.inverseBtnPrimary, themeVariables.semanticColors.menuBackground)
    .set(Theme.Button.inverseBtnPrimaryTextColor, themeVariables.semanticColors.menuItemText)
    .set(Theme.Logo.logo, customTheme?.mainLogo || 'https://staking.ferrum.network/static/media/logo.44e552d9.png')
    .set(Theme.Logo.logoHeight, customTheme?.logoHeight || -1)
    .build();
  return new ThemeConstantProvider('web3-theme', themeConstants);
}

function DashboardComponent(props: DashboardProps&DashboardDispatch) {
    const {onBridgeLoad, fatalError} = props;
    useEffect(() => {
      // Prevent infinite loop if onLoad causes error
        onBridgeLoad().catch(console.error);
    }, [fatalError]);
    const themeVariables = useTheme();
    const theme = _loadTheme(themeVariables, props.customTheme);
    const styles = themedStyles(theme);
    const testAlert = CONFIG.isProd ? undefined : (
      <><Row withPadding><Text size={'largest'} content={'TEST MODE'}/></Row></>)
    if (props.initialized) {
        // Render the routes
        return (
            <>
              <WebPageWrapper
                mode={BackendMode.mode}
                theme={theme}
                onConnected={props.onConnected}
                onDisconnected={props.onDisconnected}
                onConnectionFailed={props.onConnectionFailed}
                container={props.initialized ? IocModule.container() : undefined}
                authError={props.error}
                isBridgeHome={!(props.initialised && (props.connected || props.isPaired))}
                isBridge
                panelOpen={props.panelOpen}
                bodyDismiss={props.openPanelHandler}
              >
                <Gap/>
                  <div className="main-header" style={styles.headerStyles}> Ferrum Token Bridge </div>
                <Switch>
                    <Route path='/bridgetmp'>
                      <DummyBridgeContainer onConnected={props.onConnected}/>
                    </Route>
                    <Route path='/:gid/liquidity'>
                        <LiquidityContainer/>
                    </Route>
                    <Route path='/:gid/swap'>
                        <SwapContainer
                            con={props.openPanelHandler}
                        />
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

//@ts-ignore
const themedStyles = (theme) => ({
  inputStyle:  {
      root: [
        {
          color: theme.get(Theme.Button.btnPrimaryTextColor),
          height: '40px',
        }
      ]
  },
  headerStyles: {
      color: theme.get(Theme.Colors.textColor),
  }
});

export const DashboardContainer = connect(
  Dashboard.mapStateToProps, Dashboard.mapDispatchToProps)(DashboardComponent);
