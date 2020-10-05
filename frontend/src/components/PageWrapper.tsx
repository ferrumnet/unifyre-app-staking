import React from 'react';
import { BackendMode, Utils } from '../common/Utils';
import {
    Page, Row,ThemedText, Gap,PageTopPart,
    // @ts-ignore
} from 'unifyre-web-components';
import {
    DesktopPage,FullScreen
    // @ts-ignore
} from 'desktop-components-library';
import { Label, Provider, Text , teamsTheme} from '@fluentui/react-northstar';
import { ConnectButtonContainer } from './ConnectButton';
import {NavBar} from './NavBar';
import {Footer} from './Footer';
import './nav.scss';

function DesktopPageWrapper(props: {children: any}) {
    const connect = BackendMode.mode === 'web3' ? (
                <ConnectButtonContainer />
    ) : undefined;
    return (
        <>
        <div className="navigation" >
            <input type="checkbox" className="navigation__checkbox" id="navi-toggle"/>
            <label htmlFor="navi-toggle" className="navigation__button"></label>
            <div className="navigation__background">&nbsp;</div>
            <nav className="navigation__nav">
                <ul className="navigation__list">
                    <li className="navigation__item"><a href="#" className="navigation__link">Staking Pools</a></li>
                    <li className="navigation__item"><a href="#" className="navigation__link">Recent Transactions</a></li>

                </ul>
            </nav>
        </div>
      
        <DesktopPage 
            NavBar={
                <NavBar 
                    connect={connect}
                    withShadow={true}
                >
                </NavBar>
            }
            withShadow={true}
            Footer={
                <Footer>
                </Footer>
            }
        >
            {props.children}
        </DesktopPage>
        </>
    );
}

export function PageWrapper(props: {children: any}) {
    if (Utils.platform() === 'desktop') {
        return <DesktopPageWrapper >{props.children}</DesktopPageWrapper>
    }

    // For mobile
    return (
        <Page>
            {props.children}
        </Page>
    );
}
