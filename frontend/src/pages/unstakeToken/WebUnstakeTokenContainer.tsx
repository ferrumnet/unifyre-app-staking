import React, {useContext,useEffect,useState} from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
    Page,PageTopPart,  Row, ThemedText, Gap, InputCurrency, ThemedButton, ErrorMessage,
    InputGroupAddon, ThemedLink
    // @ts-ignore
} from 'unifyre-web-components';
import { dataFormat,formatter, Utils } from "../../common/Utils";
import { StakeToken } from './../stakeToken/StakeToken';
import { Big } from 'big.js';
import {ThemeContext} from 'unifyre-react-helper';
import { LoaderContainer } from '../../components/Loader';
import { Header,Divider,Button} from '@fluentui/react-northstar';
import { Flex } from '@fluentui/react-northstar';
import './stake.scss';
import {List} from '../../components/list';
import { UnstakeToken, UnstakeTokenDispatch, UnstakeTokenProps } from './UnstakeToken';

function UnstakeTokenComponent(props: UnstakeTokenProps&UnstakeTokenDispatch) {
    const {symbol,stakingCap} = props.contract;   
    const history = useHistory();
    const {contract} = props;
    var utcSeconds = contract.stakingStarts;
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);

    const fields = [
       
        {
            value: 'You Have Staked',
            lable: `${props.userStake?.amountInStake} ${props.symbol}`
        },
        {
            value: 'Rewards if un-staked today',
            lable: props.unstakeRewardsNow
        },
        {
            value: 'Rewards at maturity',
            lable: props.unstakeRewardsMaturity
        },
        {
            value: 'Early withdraw starts',
            lable: dataFormat(props.contract.withdrawStarts)
        },
        {
            value: 'Maturity',
            lable: dataFormat(props.contract.withdrawEnds)
        }
            
    ]

    const [time,setTime] = useState({'days': 0,'hours':0,'minutes':0,'seconds':0})

    useEffect(() => {
        var countDownDate = new Date("Jan 5, 2021 15:37:25").getTime();
        
        setInterval(()=> {
            var now = new Date().getTime();
            var distance = countDownDate - now;    
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setTime({days,hours,minutes,seconds})
        },1000);
    });

    const {balance} = props;
    const error = props.error ? (
        <Row withPadding>
            <ErrorMessage text={props.error} />
        </Row>
    ) : undefined;

    return (
        <div className="staking">
            <LoaderContainer />
            <div className="main_address">
                    <>
                        <Header as="h2" content={`UnStake ${props.symbol}`} />
                        <Header as="h4" content="PLATINUM POOL" color='red' />
                        <div className="details_header">
                            <Divider fitted size={3} color='red' />
                        </div>
                    </>
                    <div className="address_container">
                    <ThemedText.H4>{'Amount To Withdraw'}</ThemedText.H4>
                    <Gap size={'small'}/>
                    <input
                        value={props.amount}
                        onChange={(v:any)=>props.onAmountToUnstakeChanged(v.target.value)}
                        placeholder={`0  ${props.symbol}`} 
                    />
                    <Gap size={'small'}/>
                    <ThemedText.H4>{'Amount In Stake'}</ThemedText.H4>
                    <Gap size={'small'}/>
                    <input 
                        value={`${formatter.format(
                            new Big(stakingCap || '0').minus(new Big(props.amount || '0')).toFixed(),true)} ${symbol}`}
                        inputMode={'decimal'}
                        disabled={true}
                    />
                    <Gap size={'small'}/>                    
                    <Button 
                        className="btn" 
                        iconPosition="before"
                        primary
                        content={`UnStake`}
                        onClick={()=>{props.onUnstakeToken(props)}}
                    />
                </div>
            </div>
            <div className="details prestaking">              
                <div className="details_card"> 
                    <div className="details_card__side  details_card__side__front">
                        <Gap/>
                        <div className="mini_header">
                            <Header as="h4" content="DETAILS" color='red' />
                            <div className="details_header">
                                <Divider fitted size={3} color='red' />
                            </div>
                        </div>
                        <Gap/>
                        {
                            fields.map(e=>
                                <List value={e.value} lable={e.lable}/>
                            )
                        }
                    </div>
                    <div className="details_card__side details_card__side__back">
                        <div className="details_card__cta">
                            <p className="details_card_value">{'STAKING'}</p>
                            <p className="details_card_value">{'Ends In'}</p>
                            <p className="details_card_value_sub">{dataFormat(props.contract.stakingEnds)} </p>
                        </div>
                        <p className="details_card_sub">{time.days + "d " + time.hours + "h " + time.minutes + "m " + time.seconds + "s "}</p>

                    </div>
                    
                </div>
            </div>
        </div>
    );
}

export const UnstakeTokenContainer = connect(
    UnstakeToken.mapStateToProps, UnstakeToken.mapDispatchToProps)(UnstakeTokenComponent);
    
  //@ts-ignore
const themedStyles = (theme) => ({
    stakingInfoHeader: { 
        justifyContent: 'center',  
        fontSize: '19px',
        fontWeight: 'bold',
        letterspacing: 1,
        lineHeight: '1.2'
    },
    stakingAmountStyle: {
        fontSize: '33px',
        lineHeight: 1,
        fontWeight: 900,
        letterSpacing: '2.4px',
        color:'rgb(255 59 47 / 88%)'
    },
    stakingSymbol:{
        paddingTop: '3px',
        letterSpacing: 1
    },
    unifyreMainTextlineHeight: {
        lineHeight: 0.9
    },
    smallerMediumText:{
        fontSize: '13px',
        letterSpacing: '1px',
        lineHeight: '0.8'
    },
    navHeader: {
        fontSize: '17px',
        lineHeight: 1
    },
    mediumText: {
        fontSize: '25px',
        fontWeight: 'bold',
        letterSpacing: '1px',
        lineHeight: '1.2'
    },
    littleText: {
        fontSize: '12.5px',
        fontWeight: 'bold'
    },
    percentStake: {
        textAlign: "center" as "center",
        marginTop: '15px',
        marginRight: '0px',
        marginLeft: '40px',
        marginBottom: '2px',
        width:'40%',
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
        width: '10%',
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
        lineHeight:1.6,
        fontSize: '15px',
        fontWeight: 'bold',
        letterSpacing: '1px',
    }
});
