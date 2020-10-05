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
    const FleuntThemeProvider = new ThemeConstantProvider('web3-theme', WebdefaultLightThemeConstantsBuilder(themeVariables).build());
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
