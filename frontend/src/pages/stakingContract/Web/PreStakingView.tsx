import React,{useEffect,useState} from 'react';
import { useHistory } from 'react-router-dom';
import { StakingContractDispatch, StakingContractProps } from '../StakingContract';
import './staking.scss';
import {List} from '../../../components/list';
import {
    Gap
    // @ts-ignore
} from 'unifyre-web-components';
import { Header,Divider,Button} from '@fluentui/react-northstar';
import { dataFormat, Utils } from "../../../common/Utils";

export function PreStakingView (props: StakingContractProps&StakingContractDispatch) {
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
    const [tillMon, tillDay, tillHour] = Utils.tillDate(props.contract.withdrawEnds);
      
    return (
        <div className="withdraw_Container pre_staking">
            <div className="main_address">
                    <>
                        <Header as="h2" content="PLATINUM" />
                        <Header as="h4" content="STAKING POOL" color='red' />
                        <div className="details_header">
                            <Divider fitted size={3} color='red' />
                        </div>
                    </>
                <div className="address_container">
                    <input value={props.userStake?.userAddress} />
                    <Gap/>
                    <div className="space"></div>
                    <input value={props.userStake?.userAddress} />
                </div>
                <Button 
                    className="btn" 
                    content="Stake" 
                    iconPosition="before"
                    primary 
                    disabled={props.state !== 'withdraw' && props.state !== 'maturity'}
                />

            </div>
            <div className="details prestaking">              
                <div className="details_card">
                    <div className="details_card__side details_card__side__front_pre">
                        <div className="details_card__cta">
                            <p className="details_card_value">{'STAKING'}</p>
                            <p className="details_card_value">{'Starts Soon.'}</p>
                            <p className="details_card_value_sub">{dataFormat(props.contract.stakingStarts)} </p>
                        </div>
                        <p className="details_card_sub">{time.days + "d " + time.hours + "h " + time.minutes + "m " + time.seconds + "s "}</p>

                    </div>
                    <div className="details_card__side  details_card__side__back_pre">
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
                    
                </div>
            </div>
        </div>
    )
}