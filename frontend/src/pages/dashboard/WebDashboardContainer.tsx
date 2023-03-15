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
import { CONFIG, IocModule } from '../../common/IocModule';
import { Theme, ThemeConstantProvider, WebdefaultDarkThemeConstantsBuilder } from 'unifyre-react-helper';
import { MainContainer } from '../main/WebMainContainer';
import { StakeTokenContainer as WebStakeTokenContainer } from '../stakeToken/WebStakeToken';
import { UnstakeTokenContainer as WebUnStakeToken } from '../unstakeToken/WebUnstakeTokenContainer';
import {ConfirmTxnContainer} from '../confirmation/ConfirmTxnContainer';
import { BackendMode, Utils } from '../../common/Utils';
import { StakingContractContainer as WebStakingContractContainer } from '../stakingContract/Web/index';
import { Theme as FulentTheme, useTheme } from '@fluentui/react-theme-provider';
import { WebWaitingContainer } from '../../components/WebWaiting';
import { WebPageWrapper } from '../../components/WebPageWrapper';
import { AdminDashContainer } from "../admin/dashboard";
import { LoginContainer } from "../admin/dashboard/login";
import { GroupInfoContainer } from "../admin/groupInfo";
import { StakingInfoContainer } from "../admin/stakings";


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
    const {onLoad, onAdminLoad, onBridgeLoad, fatalError} = props;
    const groupId = Utils.getGroupIdFromHref();
    const history = useHistory();
    useEffect(() => {
      // Prevent infinite loop if onLoad causes error
      if(groupId === 'admin'){
        onAdminLoad(history).catch(console.error);
      } else if (BackendMode.app === 'bridge') {
        onBridgeLoad().catch(console.error);
      } else {
        if (!fatalError) {
          onLoad(groupId).catch(console.error);
        }
      }
 
    }, [onLoad, groupId, fatalError]);
    const themeVariables = useTheme();
    const theme = _loadTheme(themeVariables, props.customTheme);

    const testAlert = CONFIG.isProd ? undefined : (
      <><Row withPadding><Text size={'largest'} content={'TEST MODE'}/></Row></>)
    if (props.initialized) {
        // Render the routes
        return (
            <>
            <WebPageWrapper
                footerHtml={props.footerHtml} homepage={props.homepage}
                noMainPage={props.noMainPage}
                mode={BackendMode.mode}
                theme={theme}
                onConnected={props.onConnected}
                onDisconnected={props.onDisconnected}
                isAdminPage={groupId === 'admin'}
                onConnectionFailed={props.onConnectionFailed}
                container={props.initialized ? groupId != 'admin' ? IocModule.container() : undefined : undefined}
                authError={props.error}
                panelOpen={false}
              >
              <Switch>
                  <Route path='/:gid/confirm/:transactionId'>
                        <ConfirmTxnContainer/>
                  </Route>
                  <Route path='/:groupId/unstake/:contractAddress'>
                        <WebUnStakeToken/>
                  </Route>
                  <Route path='/:groupId/stake/:contractAddress'>
                        <WebStakeTokenContainer/>
                  </Route>
                  <Route path='/:gid/info/:contractAddress/:network'>
                        <WebStakingContractContainer />
                  </Route>
                  <Route path='/:gid/info/:contractAddress'>
                        <WebStakingContractContainer />
                  </Route>
                  <Route path="/:gid/continuation">
                    <ConfirmTxnContainer />
                  </Route>
                  <Route path='/admin/login'>
                    <LoginContainer/>
                  </Route>
                  <Route path='/admin/staking'>
                    <StakingInfoContainer/>
                  </Route>
                  <Route path='/admin/groupInfo'>
                    <GroupInfoContainer/>
                  </Route>
                  <Route path='/admin'>
                    <AdminDashContainer/>
                  </Route>
                  <Route path='/'>
                        {
                          Utils.getQueryparam('continuation') ? 
                            <ConfirmTxnContainer /> : <MainContainer />
                        }
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
        {
           groupId === 'admin' && <LoginContainer/>
        }
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

export const WebDashboardContainer = connect(
  Dashboard.mapStateToProps, Dashboard.mapDispatchToProps)(DashboardComponent);