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

function ConButton(props: {connected: boolean, address: string, onClick: () => void, error?: string}) {
    const theme = useContext(ThemeContext);   
    const styles = themedStyles(theme);
    return (
        <>
            <WebThemedButton
                text={props.connected ? Utils.shorten(props.address) : 'Connect'} 
                disabled={props.connected}
                onClick={props.onClick} 
                highlight={false}
                customStyle={styles.btnStyle}
            />
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
    }
})