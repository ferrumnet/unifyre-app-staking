import React,{useContext} from 'react';
import {Theme,ThemeContext} from 'unifyre-react-helper';
import { MessageBar, MessageBarType } from '@fluentui/react';
import './nav.scss';
import {
    WebThemedButton
    // @ts-ignore
} from 'desktop-components-library';
import {
    Row,
    //@ts-ignore
} from 'unifyre-web-components';
import { ReponsivePageWrapperDispatch, ReponsivePageWrapperProps, ResponsiveConnectProps } from './PageWrapperTypes';
import { ConnectorContainer } from '../connect/ConnectContainer';
import { RootState } from '../common/RootState';
import { Utils } from '../common/Utils';
import { ToastProvider, useToasts } from 'react-toast-notifications';
import {ConnectButtonWapper} from './../connect/ConnectButtonWrapper'
import { Button } from "react-bootstrap";
import { Networks } from "ferrum-plumbing";

function ErrorBar(props: {error: string}) {
    return (
        <Row withPadding>
            <MessageBar
                messageBarType={MessageBarType.blocked}
                isMultiline={true}
                dismissButtonAriaLabel="Close"
                truncated={true}
                overflowButtonAriaLabel="See more"
            >
                {props.error}
            </MessageBar>
        </Row>
    );
}


export function ConButton(props: {connected: boolean, address: string, onClick: () => void, error?: string,isBridge?:boolean}) {
    const theme = useContext(ThemeContext);   
    const styles = themedStyles(theme);
    return (
        <>
            {
                (!props.connected) &&
                    <WebThemedButton
                        text={props.connected ? (props.address ? Utils.shorten(props.address) : ('Connection Failed, Invalid Wallet Network Detected')) : 'Connect'} 
                        onClick={props.onClick} 
                        highlight={false}
                        customStyle={styles.btnStyle}
                    />
            }
            
            {
                        props.connected && 
                            <WebThemedButton
                                text={'Disconnect'} 
                                disabled={false}
                                onClick={props.onClick} 
                                highlight={false}
                                customStyle={styles.btnStyle}
                            />
            }
        </>
    )
}


export const FRM: {[k: string]: [string, string,string]} = {
    'ETHEREUM': ['ETHEREUM:0xe5caef4af8780e59df925470b050fb23c43ca68c', 'FRM','ETHEREUM'],
    'RINKEBY': ['RINKEBY:0xfe00ee6f00dd7ed533157f6250656b4e007e7179', 'FRM','RINKEBY'],
    'POLYGON': ['POLYGON:0xd99bafe5031cc8b345cb2e8c80135991f12d7130', 'FRM','MATIC'],
    'BSC_TESTNET': ['BSC_TESTNET:0xfe00ee6f00dd7ed533157f6250656b4e007e7179', 'FRM','BSC_TESTNET'],
    'MUMBAI_TESTNET': ['MUMBAI_TESTNET:0xfe00ee6f00dd7ed533157f6250656b4e007e7179', 'FRM','MUMBAI_TESTNET'],
};

export const FRMX: {[k: string]: [string, string]} = {
    'ETHEREUM': ['ETHEREUM:0xf6832EA221ebFDc2363729721A146E6745354b14', 'FRMX'],
};

export const ConnectButton = ({ ...rest }) => {
  return (
    <Button
      variant="pri"
      className={`btn-icon btn-connect}`}
      onClick={rest.onClick}
    >
      <i className="mdi mdi-wallet"></i> <span>{!rest.connected ? 'Connect' : 'Disconnect'}</span>
    </Button>
  );
};

export function ConnectBtn(props: any) {
    const frmBalance = props.balances.find((a:any) => a.currency === (FRM[a.network]||[])[0]);
    const frmxBalance = props.balances.find((a:any) => a.currency === (FRMX[a.network]||[])[0]);
    const ethBalance = props.balances.find((a:any)=> a.currency === Networks.for(a.network).baseCurrency);
    console.log(props,'props')
    return (
        <ConnectButton
            frmBalance={frmBalance?.balance || '0'}
            frmxBalance={frmxBalance?.balance || '0'}
            ethBalance={ethBalance?.balance || '0'}
            ethSymbol={ethBalance?.symbol || Networks.for(ethBalance!.network)?.baseSymbol || 'ETH'}
            {...props}
        />
    )
}

export function BridgeNavBar(props: ReponsivePageWrapperProps&ReponsivePageWrapperDispatch&ResponsiveConnectProps&{children: any}){
    const theme = useContext(ThemeContext);   
    const styles = themedStyles(theme);
    const { addToast } = useToasts();

    const error = props.error ? (
        <ErrorBar error={props.error} />
    ) : props.notiError ?
         addToast(props.notiError, { appearance: 'error' })
    : undefined;

    const ConBot = ConnectorContainer.Connect(props.container, ConButton);

    const ConBot2 = <ConnectButtonWapper View={ConnectBtn} />
    return(
        <>
            <div className="nav-bar page-container" style={{...styles.container,backgroundColor: 'transparent'}}>
                <div className="nav-logo">
                    <a href={props.homepage}>
                    <img
                        className="logo_img"
                        src={theme.get(Theme.Logo.logo)  as any}
                        style={{height: theme.get(Theme.Logo.logoHeight) > 0 ? theme.get(Theme.Logo.logoHeight) : undefined}}
                        alt="Logo"
                    /> 
                    </a>
                </div>
                <div className="mobile-nav-logo">'<a href={props.homepage}>
                    <img
                        className="logo_img"
                        src={"https://s2.coinmarketcap.com/static/img/coins/64x64/4228.png" }
                        style={{height: theme.get(Theme.Logo.logoHeight) > 0 ? theme.get(Theme.Logo.logoHeight) : undefined}}
                        alt="Logo"
                    /> 
                    </a>
                </div>
                <div className="nav-children" style={{...styles.bridgeStyle}}>
                    <div></div>
                    {
                            !props.isBridgeHome && 
                        <>
                            {props.children}
                            <div>
                                {ConBot2}
                            </div>
                            <div>
                                <ConBot 
                                    onConnect={props.onConnected}
                                    onConnectionFailed={props.onConnectionFailed}
                                    dataSelector={(state: RootState) => state.data.userData}
                                    // appInitialized={props.initialized}
                                    appInitialized={true}
                                    isBridge={true}
                                />
                            </div>
                        </>
                    }
                </div>
            </div>
            {error}
        </>
    )
}


export function NavBar(props: ReponsivePageWrapperProps&ReponsivePageWrapperDispatch&ResponsiveConnectProps&{children: any}) { 
    const theme = useContext(ThemeContext);   
    const styles = themedStyles(theme);
    const error = props.error ? (
        <ErrorBar error={props.error} />
    ) : undefined;

    const ConBot = ConnectorContainer.Connect(props.container, ConButton);
    const ConBot2 = <ConnectButtonWapper View={ConnectBtn} />

    return (
        <>
            <div className="nav-bar page-container" style={{...styles.container}}>
                <a href={props.homepage}>
                <img
                    className="logo_img"
                    src={theme.get(Theme.Logo.logo)  as any}
                    style={{height: theme.get(Theme.Logo.logoHeight) > 0 ? theme.get(Theme.Logo.logoHeight) : undefined}}
                    alt="Logo"
                /> 
                </a>
                {props.children}
                <div className="nav-children">
                    {
                        !props.isAdminPage &&
                            <ConBot 
                                onConnect={props.onConnected}
                                onConnectionFailed={props.onConnectionFailed}
                                dataSelector={(state: RootState) => state.data.userData}
                                // appInitialized={props.initialized}
                                appInitialized={true}
                                isBridge={false}
                            />
                    }
                </div>
            </div>
            {error}
        </>
    )
}

//@ts-ignore
const themedStyles = (theme) => ({
    container: {
        color: theme.get(Theme.Colors.textColor),
        backgroundColor: theme.get(Theme.Colors.themeNavBkg),
    },
    btnStyle: {
        padding: '1rem'
    },
    bridgeStyle: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '50%',
        alignItems: 'center',
        cursor: 'pointer',
        color: theme.get(Theme.Colors.textColor),
    },
    navTxt: {
        display: 'flex',
        color: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    }
})