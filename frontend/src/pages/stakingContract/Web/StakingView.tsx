import React,{useContext,useEffect,useState} from 'react';
import { useHistory } from 'react-router-dom';
import { StakingContract, StakingContractDispatch, StakingContractProps } from '../StakingContract';
import './staking.scss';
import {List} from '../../../components/list';
import {
    Page,PageTopPart,  Row, ThemedText, Gap,InputGroupAddon,ThemedButton
    // @ts-ignore
} from 'unifyre-web-components';
import { Header,Divider,Button} from '@fluentui/react-northstar';
import { Flex, Segment } from '@fluentui/react-northstar';
import { dataFormat, Utils } from "../../../common/Utils";
import {ThemeContext, Theme} from 'unifyre-react-helper';

export function StakingView (props: StakingContractProps&StakingContractDispatch) {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    
    const history = useHistory();
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
      
    return (
             <Flex 
                gap="gap.large" 
                hAlign="center" 
                vAlign="center" 
                className="withdraw_Container pre_staking"
                padding="padding.medium"
            >      
                <Flex.Item align="center" size="size.half">
                    <div className="main_address">
                        <>
                            <Header as="h2" content={`Start Staking ${props.symbol}`} />
                            <Header as="h4" content="PLATINUM POOL" color={styles.categoryColor.color} />
                            <div className="details_header">
                                <Divider fitted size={3} color={styles.categoryColor.color} />
                            </div>
                        </>
                        <div className="address_container">
                            <input value={props.userStake?.userAddress} />
                            <Gap/>
                            <div className="space"></div>
                            <input value={props.userStake?.userAddress} />
                        </div>
                        <div className="button_container">
                            <Button 
                                className="btn" 
                                iconPosition="before"
                                primary
                                content={
                                    props.filled ? 'Filled' :
                                        props.userStake?.amountInStake === '0' ? `Start Winning` : `Stake More ${props.symbol}`}
                                onClick={() => props.onContractSelected(history,props.contract.contractAddress,false)}
                                disabled={props.filled}
                            />
                        </div>
                    </div>
                </Flex.Item>
                <Flex.Item align="center" size="size.half">
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
                </Flex.Item>
            </Flex> 
    )
}

const themedStyles = (theme:any) => ({
    categoryColor: {
        color: theme.get(Theme.Colors.textColor),
    },
})