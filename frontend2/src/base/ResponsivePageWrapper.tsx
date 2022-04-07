/**
 * This is a generic wrapper used by all unifyre apps.
 * This page wrapper reacts to application mode (web3 or unifyre)
 * and shows the correct details. It also supports Fluent-UI theming if provided.
 * 
 * Another role of this page it to manage connect/disconnect events.
 * It expects to UnifyreAppClientBase ber registed with container and implemented.
 */
import { Provider as FluentProvider, teamsTheme } from '@fluentui/react-northstar';
import React from 'react';
import { ThemeContext } from 'unifyre-react-helper';
import { UnifyrePageWrapper } from './PageWrapper';
import { ReponsivePageWrapperDispatch, ReponsivePageWrapperProps } from './PageWrapperTypes';

export function ResponsivePageWrapper(props: ReponsivePageWrapperProps&ReponsivePageWrapperDispatch) {
    if (props.mode === 'web3') {
        return (
            <>
            <ThemeContext.Provider value={props.theme}>
                <FluentProvider theme={teamsTheme}>
                    <UnifyrePageWrapper {...props} />
                </FluentProvider>
            </ThemeContext.Provider>
            </>
        );
    } else {
        return (
            <>
            <ThemeContext.Provider value={props.theme}>
                <UnifyrePageWrapper {...props} />
            </ThemeContext.Provider>
            </>
        );
    }
}