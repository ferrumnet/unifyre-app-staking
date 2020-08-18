import React from 'react';
import logo from './logo.svg';
import './App.css';
import {ThemeContext, ThemeConstantProvider, Theme, defaultDarkThemeConstantsBuilder} from 'unifyre-react-helper';
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
import { DashboardContainer } from './pages/dashboard/DashboardContainer';

// optional configuration
const options = {
  // you can also just use 'bottom center'
  timeout: 4000,
}

function App() {
  let themeProvider = new ThemeConstantProvider('unifyre', defaultDarkThemeConstantsBuilder
  .set(Theme.Font.main, "'Open Sans', sans-serif").build());

  return (
    <ThemeContext.Provider value={themeProvider}>
          <Provider store={store}>
            <Dialogue.Component />
            <AlertProvider template={AlertTemplate} {...options}>
              <Router>
                <DashboardContainer />
              </Router>
            </AlertProvider>
            <WaitingContainer />
          </Provider>
      </ThemeContext.Provider>
    
  );
}

export default App;
