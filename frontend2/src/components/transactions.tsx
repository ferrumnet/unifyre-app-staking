import React, {useContext, useState} from 'react';
import {
    Row,
    // @ts-ignore
} from 'unifyre-web-components';
import {ThemeContext, Theme} from 'unifyre-react-helper';
import stakeImg from "../images/next.png"
import unstakeImg from "../images/out.png"
import moment from 'moment';

interface transactionsProps {
    type: "stake" | "unstake",
    amount: string,
    reward: string,
    status: string,
    symbol: string,
    rewardSymbol: string,
    contractName: string,
    createdAt: number,
    url: string,
}
export const Transactions = (props:transactionsProps) => {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    const [expand] = useState(false);
    const title = props.type === 'stake' ? (
        `${props.type} ${props.amount} ${props.symbol}`
    ) : (
        `${props.type} ${props.amount} ${props.symbol} + ${props.reward} ${props.rewardSymbol}`
    );
    return (
        <Row withPadding noMarginTop>
            <a
            style={styles.Container} className={`transaction_tile ${expand ? 'container' : 'collapsed'}`}
            onClick={() => window.open(props.url, '_blank')}
            >
                <div style={styles.btnContainer}>
                    <div style={styles.tokenInfo}>
                        <div style={styles.tokenSymbol}>
                            <img 
                            style={{"width":'30px'}} src={props.type==="stake"?stakeImg:unstakeImg}
                            alt="token"
                            />
                        </div>
                        <div style={{display:'flex', flexDirection: 'column', alignItems:'stretch', flex: 1}}>
                            <div 
                            style={{"lineHeight": "1.4", display: 'flex', flexDirection: 'row', width:'100%',
                                    justifyContent: 'space-between'}}>
                                <div style={styles.categoryText}>
                                    {title}
                                </div>
                                <div style={styles.symb}>
                                    {props.status}
                                </div>
                            </div>
                            <div 
                            style={{"lineHeight": "1.4", display: 'flex', flexDirection: 'row', width:'100%',
                                    justifyContent: 'space-between'}}>
                                <div style={styles.categoryText}>
                                    {props.contractName} 
                                </div>
                                <div style={styles.categoryText}>
                                    {moment(props.createdAt).fromNow()} 
                                </div>
                            </div>
                        </div>
                    </div> 
                </div>
            </a>
        </Row>
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
        color: 'white',
        justifyContent: 'space-around',
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
    }
});