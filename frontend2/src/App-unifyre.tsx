import React from 'react';
import './App.scss';
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
  return (
    <Provider store={store}>
      <Dialogue.Component />
      <AlertProvider template={AlertTemplate} {...options}>
        <Router>
          <DashboardContainer />
        </Router>
      </AlertProvider>
      <WaitingContainer />
    </Provider>
  )
}

export default App;
