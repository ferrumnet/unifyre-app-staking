import React from 'react';
import {
    Page,
    // @ts-ignore
} from 'unifyre-web-components';
import {
    DesktopPage,
    // @ts-ignore
} from 'desktop-components-library';
import {NavBar,BridgeNavBar} from './NavBar';
import {Footer} from './Footer';
import './nav.scss';
import { PageWrapperUtils, ReponsivePageWrapperDispatch, ReponsivePageWrapperProps } from './PageWrapperTypes';

function DesktopPageWrapper(props: ReponsivePageWrapperProps&ReponsivePageWrapperDispatch) {
    return (
        <>
        <DesktopPage 
            NavBar={
                !props.isBridge ? 
                    <NavBar {...props} error={props.authError} >
                        {props.navBarContent}
                    </NavBar>
                :   <BridgeNavBar {...props} error={props.authError} >
                        {props.navBarContent}
                    </BridgeNavBar>
            }
            Footer={
                <Footer
                    htmlFooter={props.footerHtml}
                >
                </Footer>
            }
        >
            {props.children}
        </DesktopPage>
        </>
    );
}

export function UnifyrePageWrapper(props: ReponsivePageWrapperProps&ReponsivePageWrapperDispatch) {
    if (PageWrapperUtils.platform() === 'desktop' || props.mode === 'web3') {
        return <DesktopPageWrapper {...props}>{props.children}</DesktopPageWrapper>
    }

    // For mobile
    return (
        <Page>
            {props.children}
        </Page>
    );
}
