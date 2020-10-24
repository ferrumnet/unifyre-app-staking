import React from 'react';
import { BackendMode, Utils } from '../common/Utils';
import {
    Page,
    // @ts-ignore
} from 'unifyre-web-components';
import {
    DesktopPage,
    // @ts-ignore
} from 'desktop-components-library';
import { ConnectButtonContainer } from './ConnectButton';
import {NavBar} from './NavBar';
import {Footer} from './Footer';
import './nav.scss';
import { ActionButton } from '@fluentui/react';
import { useHistory, useParams } from 'react-router';

function DesktopPageWrapper(props: {children: any, footerHtml?: string,
    homepage?: string, noMainPage?: boolean}) {
    const connect = BackendMode.mode === 'web3' ? (
                <ConnectButtonContainer />
    ) : undefined;
    const history = useHistory();
    const groupId = Utils.getGroupIdFromHref();
    return (
        <>
        <DesktopPage 
            NavBar={
                <NavBar 
                    connect={connect}
                >
                    <ActionButton
                        onClick={() => {
                            if (props.noMainPage) {
                                window.location.href = props.homepage!;
                            } else {
                                return history.push('/' + groupId);
                            }
                        }}
                        allowDisabledFocus>
                        Staking Options
                    </ActionButton>
                    
                </NavBar>
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

export function PageWrapper(props: {children: any, noMainPage?: boolean,
        footerHtml?: string, homepage?: string}) {
    if (Utils.platform() === 'desktop') {
        return <DesktopPageWrapper
            footerHtml={props.footerHtml} homepage={props.homepage}
            noMainPage={props.noMainPage}
            >{props.children}</DesktopPageWrapper>
    }

    // For mobile
    return (
        <Page>
            {props.children}
        </Page>
    );
}
