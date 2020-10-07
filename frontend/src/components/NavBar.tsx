import React,{useContext} from 'react';
import {Theme,ThemeContext} from 'unifyre-react-helper';
import { connect } from 'react-redux';
import {mapStateToProps} from './ConnectButton';
import './nav.scss';

const NavBarContainer = (props:{children: any, connect: any, htmlHeader?: string}) => {    
    const theme = useContext(ThemeContext);   
    const styles = themedStyles(theme);
    const header = props.htmlHeader ? (
        <div dangerouslySetInnerHTML={ {__html: props.htmlHeader} } ></div>
    ) : undefined;

    return (
        <>
            <div className="nav-bar page-container" style={{...styles.container}}>
                <img className="logo_img" src={theme.get(Theme.Logo.logo)  as any} 
                /> 
                <div className="nav-children">
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