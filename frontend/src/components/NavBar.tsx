import React,{useContext} from 'react';
import {
    Row, ThemedText
    // @ts-ignore
} from 'unifyre-web-components';
import {Theme,ThemeContext} from 'unifyre-react-helper';
import { connect } from 'react-redux';
import {mapStateToProps} from './ConnectButton';
import { Alert } from '@fluentui/react-northstar'

//@ts-ignore

const NavBarContainer = (props:{children,connect,withShadow?:boolean}&ConnectProp) => {    
    const theme = useContext(ThemeContext);   
    const styles = themedStyles(theme);
    let withShadowStyle;

    if (props.withShadow) {
        withShadowStyle = styles.withShadow;
    }



    return (
        <>
            <div className="nav">
                <div style={{...styles.container,...withShadowStyle}}>
                    <Row noMarginTop centered>
                        <img className="logo_img" src={theme.get(Theme.Logo.logo)  as any}/> 
                    </Row>
                    {props.children}
                    <div style={styles.rightNav}>
                        {props.connect}
                    </div>
                </div>
            </div>
            <div className="connectionLabel">
               {
               props.connected ? 
                <Alert success content="You are Connected to the Network, Enjoy Staking" />
               : 
                <Alert danger content="You are not Connected, Connect to the main network using Metamask to continue Staking" />
               }
            </div>

        </>
    )
}

export const NavBar = connect(
    mapStateToProps, {})(NavBarContainer);

//@ts-ignore
const themedStyles = (theme) => ({
    container: {
        display: 'flex',
        color: theme.get(Theme.Colors.textColor),
        backgroundColor: theme.get(Theme.Colors.themeNavBkg),
        justifyContent: 'space-between',
        padding: theme.get(Theme.Spaces.screenMarginHorizontal)/2,
    },
    withShadow: {
        boxShadow: 'rgb(80 72 72) 0px 0px 15px 0px'
    },
    rightNav: {
        minWidth: '10%',
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        borderRadius: '5px',
    },
    leftNav: {
        display: 'flex',
        width: '25%'
    },
})