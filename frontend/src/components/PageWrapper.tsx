import React from 'react';
import { BackendMode, Utils } from '../common/Utils';
import {
    Page, Row,
    // @ts-ignore
} from 'unifyre-web-components';
import { ConnectButtonContainer } from './ConnectButton';

function DesktopPageWrapper(props: {children: any}) {
    const connect = BackendMode.mode === 'web3' ? (
            <Row >
                <ConnectButtonContainer />
            </Row>
    ) : undefined;
    return (
        <Page>
            {props.children}
        </Page>
    );
}

export function PageWrapper(props: {children: any}) {
    if (Utils.platform() === 'desktop') {
        <DesktopPageWrapper>{props.children}</DesktopPageWrapper>
    }

    // For mobile
    return (
        <Page>
            {props.children}
        </Page>
    );
}
