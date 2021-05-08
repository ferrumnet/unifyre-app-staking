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
                    <WebThemedButton
                        text={props.connected ? Utils.shorten(props.address) : 'Connect'} 
                        disabled={props.connected}
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
                    <ConBot 
                        onConnect={props.onConnected}
                        onConnectionFailed={props.onConnectionFailed}
                        dataSelector={(state: RootState) => state.data.userData}
                        // appInitialized={props.initialized}
                        appInitialized={true}
                        isBridge={false}
                    />
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