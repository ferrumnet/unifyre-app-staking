import React from 'react';
import './App.scss';
import {ThemeContext, 
  ThemeConstantProvider, 
  Theme, 
  WebdefaultDarkThemeConstantsBuilder,
  WebdefaultLightThemeConstantsBuilder
} from 'unifyre-react-helper';
import {
  BrowserRouter as Router,
} from "react-router-dom";
import { Provider as AlertProvider } from 'react-alert';
import { WaitingContainer } from './components/Waiting';
import { Provider } from 'react-redux';
import { store } from './common/Store';
// @ts-ignore
import { Dialogue, } from 'unifyre-web-components';
// @ts-ignore
import AlertTemplate from 'react-alert-template-basic'
import { WebDashboardContainer } from './pages/dashboard/WebDashboardContainer';
import { Provider as FluentProvider, teamsTheme } from '@fluentui/react-northstar';
import { useTheme } from '@fluentui/react-theme-provider';
import {WebThemeLoader} from './themeLoader';
// optional configuration
const options = {
  // you can also just use 'bottom center'
  timeout: 4000,
}

function App() {
    WebThemeLoader();
    const themeVariables = useTheme();
    const themeConstants = WebdefaultDarkThemeConstantsBuilder(themeVariables)
      .set(Theme.Colors.bkgShade0, themeVariables.palette.white)
      .set(Theme.Colors.bkgShade1, '#0C1C1E')
      .set(Theme.Colors.bkgShade2, '#0C1C1E')
      .set(Theme.Colors.bkgShade3, '#FFFFFF')
      .set(Theme.Spaces.line, themeVariables.spacing.l1)
      .set(Theme.Spaces.screenMarginHorizontal, themeVariables.spacing.s2)
      .set(Theme.Spaces.screenMarginVertical, themeVariables.spacing.s2)
      .set(Theme.Spaces.gap, themeVariables.spacing.l1)
      .set(Theme.Text.pSize, themeVariables.fonts.small.fontSize as number)
      .set(Theme.Text.h1Size, themeVariables.fonts.xLarge.fontSize as number)
      .set(Theme.Text.h2Size, themeVariables.fonts.large.fontSize as number)
      .set(Theme.Text.h3Size, themeVariables.fonts.medium.fontSize as number)
      .set(Theme.Text.h4Size, themeVariables.fonts.smallPlus.fontSize as number)
      .set(Theme.Font.main, themeVariables.fonts.medium.fontFamily! as string)
      .set(Theme.Input.inputTextColor, themeVariables.semanticColors.inputText)
      .set(Theme.Button.btnPrimary, themeVariables.semanticColors.buttonBackground)
      .set(Theme.Button.btnPrimaryTextColor, themeVariables.semanticColors.buttonText)
      .set(Theme.Button.btnBorderRadius, themeVariables.spacing.s2)
      .set(Theme.Button.btnPadding, themeVariables.spacing.s1)
      .set(Theme.Button.btnHighlight, themeVariables.semanticColors.primaryButtonBackground)
      .set(Theme.Button.btnHighlightTextColor, themeVariables.semanticColors.primaryButtonText)
      .set(Theme.Button.inverseBtnPrimary, themeVariables.semanticColors.menuBackground)
      .set(Theme.Button.inverseBtnPrimaryTextColor, themeVariables.semanticColors.menuItemText)
      .build();
    const FleuntThemeProvider = new ThemeConstantProvider('web3-theme', themeConstants);
    return (
      <ThemeContext.Provider value={FleuntThemeProvider}>
        <Provider store={store}>
          <Dialogue.Component />
          <AlertProvider template={AlertTemplate} {...options}>
            <Router>
              <FluentProvider theme={teamsTheme}>
                <WebDashboardContainer />
              </FluentProvider>
            </Router>
          </AlertProvider>
          <WaitingContainer />
        </Provider>
      </ThemeContext.Provider>   
    );  
}

export default App;
