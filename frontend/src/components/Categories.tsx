import React, {useContext, useState} from 'react';
import {
    Row,Gap
    // @ts-ignore
} from 'unifyre-web-components';
import {ThemeContext, Theme} from 'unifyre-react-helper';
import { relative } from 'path';
import {formatter,dataFormat,Utils} from '../common/Utils';
import { StakingApp } from "./../common/Types";

interface categoryBtnProps {
    name: string,
    symbol:string,
    currency:string,
    stakingCap:string,
    startDate: number,
    history:any,
    staking:StakingApp,
    userAddress:string
    onStakeNow: (u:string,v:StakingApp,x:string) => void
}
export const CategoryBtn = (props:categoryBtnProps) => {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    const [expand,setExpand] = useState(false);
    const rewards = Utils.stakingRewards(props.staking);
    return (
        <Row withPadding noMarginTop>
            <div style={styles.Container} className={`${expand ? 'container' : 'collapsed'}`}>
                <div style={styles.btnContainer}>
                    <div style={styles.tokenInfo} onClick={()=>setExpand(!expand)}>
                        <div style={styles.tokenSymbol}>
                            <img style={{"width":'40px'}} src={formatter.icon(props.currency)}/>
                        </div>
                        <div style={{"lineHeight": "1.4"}}>
                            <div style={styles.categoryText}>
                                {props.name}
                            </div>
                            <div style={styles.miniText}>
                                Estimated Annual Yield
                            </div>
                        </div>
                    </div> 
                    <div style={{"marginRight":"15px"}} onClick={()=>props.onStakeNow(props.history,props.staking,props.userAddress)}>
                        <div style={styles.symb}>
                            {`${Utils.stakingRewards(props.staking).maturityAnnual }%`}
                        </div>
                        <div style={styles.rewards}>
                            Stack Now
                        </div>
                    </div>
                </div>
                {
                    expand && 
                    <>
                        <div style={styles.moreInfo} className={`${expand ? 'container-text' : 'opacitBefore'}`}>
                            <div style={{"width":'60%','textAlign':'start',fontSize: '13px'}}>
                                Estimated Annual Yield
                            </div>
                            <div style={{"width":'35%','textAlign':'start',fontSize: '13px'}}>
                                {Utils.stakingRewards(props.staking).maturityMaxAmount}
                            </div>
                        </div>
                        <div style={styles.moreInfo} className={`${expand ? 'container-text' : 'opacitBefore'}`}>
                            <div style={{"width":'50%','textAlign':'start',fontSize: '13px'}}>
                                Early Withdraw
                            </div>
                            <div style={{"width":'35%','textAlign':'start',fontSize: '13px'}}>
                                {Utils.stakingRewards(props.staking).earlyWithdrawAnnual}
                            </div>
                        </div>
                        <div style={styles.moreInfo} className={`${expand ? 'container-text' : 'opacitBefore'}`}>
                            <div style={{"width":'50%','textAlign':'start',fontSize: '13px'}}>
                                Size
                            </div>
                            <div style={{"width":'35%','textAlign':'start',fontSize: '13px'}}>
                                {props.stakingCap}
                            </div>
                        </div>
                        <div style={styles.moreInfo} className={`${expand ? 'container-text' : 'opacitBefore'}`}>
                            <div style={{"width":'50%','textAlign':'start',fontSize: '13px'}}>
                                Start Date
                            </div>
                            <div style={{"width":'35%','textAlign':'start',fontSize: '13px'}}>
                                {dataFormat(props.startDate)}
                            </div>
                        </div>
                    </>
                }
                
            </div>
        </Row>
    )
}

//@ts-ignore
const themedStyles = (theme) => ({
    Container: {
        display: 'relative',
        backgroundColor: '#ec153f',
        borderRadius: '15px',
        width: '100%',
        padding: '8px',
        marginTop: '15px'
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
        backgroundColor: '#ec153f',
        borderRadius: '15px',
        paddingBottom: '7px'
    },
    miniText: {
        fontSize: '11px',
    },
    categoryText:{
        letterSpacing: 1.5,
        fontWeight: 700,
        fontSize: '12px'
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
        color: 'white',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    tokenSymbol: {
        margin: '0px 5px',
        display: 'flex',
        alignItems: 'center'
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
    }
});