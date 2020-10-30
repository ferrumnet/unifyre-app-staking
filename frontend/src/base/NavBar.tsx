import React,{useContext} from 'react';
import {Theme,ThemeContext} from 'unifyre-react-helper';
import { MessageBar, MessageBarType } from '@fluentui/react';
import './nav.scss';
import {
    Row
    //@ts-ignore
} from 'unifyre-web-components';
import { ReponsivePageWrapperDispatch, ReponsivePageWrapperProps, ResponsiveConnectProps } from './PageWrapperTypes';
import { ConnectButton } from './ConnectButton';

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

export function NavBar(props: ReponsivePageWrapperProps&ReponsivePageWrapperDispatch&ResponsiveConnectProps&{children: any}) { 
    const theme = useContext(ThemeContext);   
    const styles = themedStyles(theme);
    const error = props.error ? (
        <ErrorBar error={props.error} />
    ) : undefined;

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
                    <ConnectButton 
                        onConnect={props.onConnected}
                        onConnectionFailed={props.onConnectionFailed}
                        container={props.container}
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
})