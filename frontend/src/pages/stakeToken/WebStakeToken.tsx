import React, {useContext,useEffect,useState} from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
    Page,PageTopPart,  Row, ThemedText, Gap, ErrorMessage
    // @ts-ignore
} from 'unifyre-web-components';
import {
    InputGroupAddon,WebThemedButton
    // @ts-ignore
} from 'desktop-components-library';
import { dataFormat,formatter } from "../../common/Utils";
import { StakeToken, StakeTokenDispatch, StakeTokenProps } from './StakeToken';
import { Big } from 'big.js';
import {ThemeContext,Theme} from 'unifyre-react-helper';
import { LoaderContainer } from '../../components/Loader';
import { StakingContractProps } from '../stakingContract/StakingContract';
import { Header,Divider} from '@fluentui/react-northstar';
import './stake.scss';
import {List} from '../../components/list';

function StakeTokenComponent(props: StakeTokenProps&StakeTokenDispatch) {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    const history = useHistory();
    

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
                        <Header as="h2" content={`Start Staking ${props.symbol}`} />
                        <Header as="h4" content="PLATINUM POOL" color={styles.categoryColor.color} />
                        <div className="details_header">
                            <Divider fitted size={3} color={styles.categoryColor.color} />
                        </div>
                    </>
                    <div className="address_container">
                    <ThemedText.H4>{'Amount To Stake'}</ThemedText.H4>
                    <Gap />
                    <InputGroupAddon
                        placeholder={`0  ${props.symbol}`}
                        editable={true} 
                    />
                    <Gap />
                    <ThemedText.H4>{'Available Balance'}</ThemedText.H4>
                    <Gap />
                    <InputGroupAddon
                          value={`${formatter.format(balance,false)} ${props.symbol}`}
                          inputMode={'decimal'}
                          disabled={true} 
                    />
                    <Gap />
                    <ThemedText.H4>{'Amount Remaining in Stake'}</ThemedText.H4>
                    <Gap />
                    <InputGroupAddon
                          value={`${formatter.format(
                            new Big(props.contract.stakingCap || '0').minus(new Big(props.contract.stakedTotal || '0')).toFixed(),true)} ${props.symbol}`}
                            disabled={true}
                    />
                    <Gap size={'small'}/>
                    <WebThemedButton
                        className="btn" 
                        iconPosition="before"
                        primary
                        content={`Submit Stake`}
                        onClick ={()=>{ props.onStakeToken(history,props) } }
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
                                <Divider fitted size={3} color={styles.categoryColor.color} />
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

export const StakeTokenContainer = connect(
  StakeToken.mapStateToProps, StakeToken.mapDispatchToProps)(StakeTokenComponent);

  //@ts-ignore
const themedStyles = (theme) => ({
    categoryColor: {
        color: theme.get(Theme.Colors.headerTextColor),
    },
});
