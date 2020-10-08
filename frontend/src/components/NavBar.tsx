import React,{useContext} from 'react';
import {Theme,ThemeContext} from 'unifyre-react-helper';
import { connect } from 'react-redux';
import {SidePaneContainer} from './ConnectButton';
import { useBoolean } from '@uifabric/react-hooks';
import { ActionButton } from '@fluentui/react';
import {mapStateToProps} from './ConnectButton';
import './nav.scss';

const NavBarContainer = (props:{children: any, connect: any, htmlHeader?: string}) => { 
    const theme = useContext(ThemeContext);   
    const styles = themedStyles(theme);
    const header = props.htmlHeader ? (
        <div dangerouslySetInnerHTML={ {__html: props.htmlHeader} } ></div>
    ) : undefined;
    const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);

    return (
        <>
            <SidePaneContainer
                isOpen={isOpen}
                dismissPanel={dismissPanel}
            />
            <div className="nav-bar page-container" style={{...styles.container}}>
                <img className="logo_img" src={theme.get(Theme.Logo.logo)  as any} 
                /> 
                <div className="nav-children">
                    <ActionButton
                        allowDisabledFocus
                        onClick={openPanel}
                    >
                        Transactions
                    </ActionButton>
                    {props.children}
                    {props.connect}
                </div>
            </div>
            {header}
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