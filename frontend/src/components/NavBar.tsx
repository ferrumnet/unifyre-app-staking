import React,{useContext,useState} from 'react';
import {Theme,ThemeContext} from 'unifyre-react-helper';
import { connect } from 'react-redux';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import {mapStateToProps,ConnectProps} from './ConnectButton';
import { useBoolean } from '@uifabric/react-hooks';
import { ActionButton } from '@fluentui/react';
import {Transactions} from '../components/transactions';
import { Utils } from '../common/Utils';
import { Label } from 'office-ui-fabric-react/lib/Label';

import './nav.scss';


const NavBarContainer = (props:{children: any, connect: any, htmlHeader?: string}&ConnectProps) => { 
    const theme = useContext(ThemeContext);   
    const styles = themedStyles(theme);
    const header = props.htmlHeader ? (
        <div dangerouslySetInnerHTML={ {__html: props.htmlHeader} } ></div>
    ) : undefined;
    const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);



    return (
        <>
             <Panel
                isOpen={isOpen}
                onDismiss={dismissPanel}
                type={PanelType.medium}
                closeButtonAriaLabel="Close"
                isLightDismiss={true}
                headerText="Recent Staking Transactions"
            >
                {
                    props.stakeEvents.length == 0 ?
                    [
                    {
                    "amountStaked": '20',
                    "symbol": 'FRM',
                    "transactionStatus":"processing",
                    "contractName": 'TextContract',
                    "createdAt": Date.now(),
                    "amountOfReward": '5',
                    "rewardSymbol": 'ETH',
                    "network": 'RINKEBY',
                    "mainTxId": '0xfrrr',
                    "type": null,
                    "v": null
                    },
                    {
                        "amountStaked": '20',
                        "symbol": 'FRM',
                        "transactionStatus":"processing",
                        "contractName": 'TextContract',
                        "createdAt": Date.now(),
                        "amountOfReward": '5',
                        "rewardSymbol": 'ETH',
                        "network": 'RINKEBY',
                        "mainTxId": '0xfrrr',
                        "type": null,
                        "v": null
                        }
                ].map((e, idx) => (
                            <Transactions
                                key={idx}
                                type={e.type || 'stake'}
                                amount={e.amountStaked}
                                symbol={e.symbol}
                                status={e.transactionStatus}
                                contractName={e.contractName}
                                createdAt={e.createdAt}
                                reward={e.amountOfReward}
                                rewardSymbol={e.v || e.symbol}
                                url={Utils.linkForTransaction(e.network, e.mainTxId)}
                            />
                        ))
                    :   <Label disabled> You do not have any recent Transactions</Label>
                }
            </Panel>
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