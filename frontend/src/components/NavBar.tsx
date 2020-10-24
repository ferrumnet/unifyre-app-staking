import React,{useContext, useState} from 'react';
import {Theme,ThemeContext} from 'unifyre-react-helper';
import { connect } from 'react-redux';
import {NavBarProps, SidePaneContainer} from './ConnectButton';
import { useBoolean } from '@uifabric/react-hooks';
import { ActionButton, MessageBar, MessageBarType } from '@fluentui/react';
import {mapStateToProps} from './ConnectButton';
import './nav.scss';
import {
    Row
    //@ts-ignore
} from 'unifyre-web-components';
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

const NavBarContainer = (props: NavBarProps&{children: any, connect: any}) => { 
    const theme = useContext(ThemeContext);   
    const styles = themedStyles(theme);
    const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);
    const error = props.error ? (
        <ErrorBar error={props.error} />
    ) : undefined;

    const dektopItems = Utils.platform() === 'desktop' ? (
        <>
            <ActionButton
                allowDisabledFocus
                onClick={openPanel}
            >
                Transactions
            </ActionButton>
        </>
    ) : undefined;

    return (
        <>
            <SidePaneContainer
                isOpen={isOpen}
                dismissPanel={dismissPanel}
            />
            <div className="nav-bar page-container" style={{...styles.container}}>
                <a href={props.homepage}>
                <img
                    className="logo_img"
                    src={theme.get(Theme.Logo.logo)  as any}
                    style={{height: theme.get(Theme.Logo.logoHeight) > 0 ? theme.get(Theme.Logo.logoHeight) : undefined}}
                /> 
                </a>
                {dektopItems}
                {props.children}
                <div className="nav-children">
                    {props.connect}
                </div>
            </div>
            {error}
        </>
    )
}

export const NavBar = connect(
    mapStateToProps, {})(NavBarContainer);

//@ts-ignore
const themedStyles = (theme) => ({
    container: {
        color: theme.get(Theme.Colors.textColor),
        backgroundColor: theme.get(Theme.Colors.themeNavBkg),
    },
})