import React from 'react';
import './App.scss';
import {
  BrowserRouter as Router,
} from "react-router-dom";
import { Provider as AlertProvider } from 'react-alert';
import { Provider } from 'react-redux';
import { store } from './common/Store';
// @ts-ignore
import { Dialogue, } from 'unifyre-web-components';
// @ts-ignore
import AlertTemplate from 'react-alert-template-basic'
import { DashboardContainer } from './tokenBridge/pages/Dashboard/DashboardContainer';
import { WebThemeLoader } from './themeLoader';
import './tokenBridge/app.scss';

// optional configuration
const options = {
  // you can also just use 'bottom center'
  timeout: 4000,
}

function App() {
    WebThemeLoader();
    return (
        <Provider store={store}>
          <Dialogue.Component />
            <AlertProvider template={AlertTemplate} {...options}>
              <Router>
                <DashboardContainer />
              </Router>
          </AlertProvider>
        </Provider>
    );  
}

export default App;
