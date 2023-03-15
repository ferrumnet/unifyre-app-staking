import { Container } from "ferrum-plumbing";
import { ThemeConstantProvider } from "unifyre-react-helper";

export type ApplicationMode = 'web3' | 'unifyre';

export interface ReponsivePageWrapperProps {
    container?: Container;
    theme: ThemeConstantProvider;
    mode: ApplicationMode;
    footerHtml?: string;
    homepage?: string;
    navBarContent?: any;
    isBridge?: boolean,
    isAdminPage?:boolean;
    isBridgeHome?: boolean,
    panelOpen:boolean,
    bodyDismiss?: () => void,
    children: any;
    authError?: string;
}

export interface ReponsivePageWrapperDispatch {
    onConnected: () => Promise<boolean>;
    onDisconnected: () => void;
    onConnectionFailed: (e: Error) => void;
}

export interface ResponsiveConnectProps {
    error?: string;
    notiError?: string;
    success?: string
}

export class PageWrapperUtils {
    static container?: Container = undefined;
    static platform(): 'desktop' | 'iOS' | 'android' {
        var iOs = /Phone|iPad|iPod/i.test(navigator.userAgent);
        var android = /Android/i.test(navigator.userAgent);
        if (iOs) { return 'iOS'; };
        if (android) { return 'android'; };
        return 'desktop';
    }
}