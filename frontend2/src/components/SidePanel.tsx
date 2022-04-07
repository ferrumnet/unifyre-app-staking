import React, {useContext, useState} from 'react';
import { connect } from 'react-redux';
import { StakeEvent } from "../common/Types";
import {Transactions} from './transactions';
import { Utils } from '../common/Utils';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { RootState } from '../common/RootState';
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';
import stakeImg from "../images/next.png"
import {ThemeContext, Theme} from 'unifyre-react-helper';
import {
    Gap
    // @ts-ignore
} from 'unifyre-web-components';
import ButtonLoader from './btnWithLoader';
import { AnyAction, Dispatch } from "redux";
import { inject, IocModule } from '../common/IocModule';
import { addAction, CommonActions } from "../common/Actions";
import { useToasts } from 'react-toast-notifications';

export interface SidePanelProps {
    stakeEvents: StakeEvent[];
    Network: string
}

export function mapStateToProps(state: RootState): SidePanelProps {
    const userProfile = state.data.userData?.profile;
    const addr = userProfile?.accountGroups[0]?.addresses || {};
    const address = addr[0] || {};
    return {
        stakeEvents: state.data.stakingData.stakeEvents,
        Network: address.network
    };
}


export const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({


});
function StakingSidePane (props:{isOpen:boolean,dismissPanel:() => void,isBridge: boolean}&SidePanelProps){
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    const { addToast } = useToasts();

    const onMessage = async (v:string) => {    
        addToast(v, { appearance: 'error',autoDismiss: true })        
    };

    const onSuccessMessage = async (v:string) => {    
        addToast(v, { appearance: 'success',autoDismiss: true })        
    };

    return (
        <Panel
            isOpen={props.isOpen}
            onDismiss={props.dismissPanel}
            type={PanelType.medium}
            closeButtonAriaLabel="Close"
            isLightDismiss={true}
            headerText= { props.isBridge ? "Active Withdrawal Items" : "Recent Staking Transactions"}
        >
            
            {
                !props.isBridge ?
                    props.stakeEvents.length > 0 ?
                        props.stakeEvents.map((e, idx) => (
                            <Transactions
                                key={idx}
                                type={e.type || 'stake'}
                                amount={e.amountStaked}
                                symbol={e.symbol}
                                status={e.transactionStatus}
                                contractName={e.contractName}
                                createdAt={e.createdAt}
                                reward={e.amountOfReward}
                                rewardSymbol={e.rewardSymbol || e.symbol}
                                url={Utils.linkForTransaction(e.network, e.mainTxId)}
                            />
                        )) :  <Label disabled>You do not have any recent Transactions</Label>
                : undefined
            }
            
                {
                    props.isBridge && 
                    <Accordion>
                    
                    </Accordion>

                }
            
        </Panel>
    )
}

//@ts-ignore
const themedStyles = (theme) => ({
    Container: {
        display: 'relative',
        borderRadius: '15px',
        width: '100%',
        padding: '1px',
        marginTop: '5px'
    },
    accInfo: {
        textAlign: "start" as 'start',
        margin: '3% 7%'
    },
    moreInfo: {
        display: 'flex',
        color: 'white',
        justifyContent: 'space-between',
        margin: '10px 30px',
        marginRight: '0px',
        width: '90%',
        letterSpacing: 1.5,
        fontWeight: 500,
        fontSize: '7px'
    },
    btnContainer: {
        display: 'flex',
        color: 'white',
        justifyContent: 'space-between',
        width: '100%',
        borderRadius: '15px',
        paddingBottom: '2px'
    },
    miniText: {
        fontSize: '11px',
    },
    categoryText:{
        letterSpacing: 1,
        fontSize: '13px'
    },
    symb:{
        fontSize: '13px',
        textAlign: 'center' as 'center',
        fontWeight: 'bold' as 'bold',
        letterSpacing: 1
    },
    rewards:{
        backgroundColor: 'white',
        color: '#c1052a',
        textAlign: "center" as "center",
        borderRadius: '5px',
        fontSize: '10px',
        fontWeight: "bold" as "bold",
        margin: '3px 0px',
        padding: '5px 20px'
    },
    tokenInfo: {
        display: 'flex',
        flex: 1,
        color: 'black',
        alignItems: 'center'
    },
    tokenSymbol: {
        margin: '0px 10px',
        display: 'flex',
        alignItems: 'center',
        marginLeft: '0px'
    },
    listContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
    },
    listItemContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        minHeight: theme.get(Theme.Spaces.line) * 4,
        padding: theme.get(Theme.Spaces.line),
    },
    stakedText:{
        fontFamily: 'Sawarabi Gothic',
        marginTop: 'auto',
        margin: '3px',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: "center" as "center",
        lineHeight: 1
    },
    commonText: {
        fontFamily: 'Sawarabi Gothic',
        fontWeight: 'bold',
        fontSize: '16.5px',
        letterSpacing: '1px'
    },
    unifyreTextColor: {
      color:  '#9a3531'
    },
    stakingInfoHeader: { 
        justifyContent: 'center',  
        fontSize: '14px',
        fontWeight: 'bold',
        letterSpacing: 1.3,
        lineHeight: '1.2'
    },
    stakingAmountStyle: {
        color: '#ffff',
        fontSize: '30px',
        lineHeight: 1,
        fontWeight: '900',
        letterSpacing: '3px'
    },
    stakingSymbol:{
        paddingTop: '3px',
        letterSpacing: 1,
        fontSize:'13px',
        fontWeight: 200
    },
    unifyreMainTextlineHeight: {
        lineHeight: 0.9
    },
    smallerMediumText:{
        fontSize: '14px',
        letterSpacing: '1px',
        lineHeight: '0.8',
        fontWeight: 200
    },
    navHeader: {
        fontSize: '17px',
        lineHeight: 1
    },
    mediumText: {
        fontSize: '25px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        lineHeight: '1.3'
    },
    littleText: {
        fontSize: '12.5px',
        fontWeight: '200'
    },
    percentStake: {
        textAlign: "center" as "center",
        marginTop: '0px',
        marginRight: '0px',
        marginLeft: '20px',
        marginBottom: '2px',
        width:'45%',
        display: 'flex',
        flexDirection: "row" as "row",
    },
    arrows: {
        marginRight: '10px',
        marginLeft: '10px',
        width: '16px'
    },
    divider: {
        height: '3px',
        borderTopStyle: "solid" as "solid",
        borderTopColor: 'rgba(249, 64, 43, 1)',
        width: '5%',
        margin: '0px auto',
    },
    highlight:{
        color: 'rgb(255, 59, 47)'
    },
    DurText: {
        fontSize: '12.5px' 
    },
    btnText: {
        color: '#ffffff',
        letterSpacing: '2px',
        lineHeight: '1.7'
    },
    bottomFix:{
        width: '99%',
        marginBottom: '1rem'
    },
    header: {
        fontSize: '45px',
        width: '80%',
        lineHeight: 0.9,
        marginLeft: '15pt'
    },
    headerStyles: {
        color: theme.get(Theme.Colors.textColor),
    },
    textStyles: {
        color: theme.get(Theme.Colors.textColor),
    },
    optionColor: {
        backgroundColor: theme.get(Theme.Colors.bkgShade0)
    }
});

export const SidePaneContainer = connect(
mapStateToProps, mapDispatchToProps)(StakingSidePane);
