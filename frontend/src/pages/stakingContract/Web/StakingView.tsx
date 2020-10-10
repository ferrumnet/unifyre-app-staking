import React,{useContext,useEffect,useState} from 'react';
import { useHistory } from 'react-router-dom';
import { StakingContractDispatch, StakingContractProps } from '../StakingContract';
import './staking.scss';
import {List} from '../../../components/list';
import {
    Gap, Row,
    // @ts-ignore
} from 'unifyre-web-components';
import { dataFormat, formatter, Utils } from "../../../common/Utils";
import {ThemeContext, Theme, intl} from 'unifyre-react-helper';
import {
    ThemedText,
    // @ts-ignore
} from 'desktop-components-library';
import { PrimaryButton } from '@fluentui/react';
import { LeftBox, RightBox } from '../../../components/WebBoxes';
import moment from 'moment';

export function StakingView (props: StakingContractProps&StakingContractDispatch) {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    
    const history = useHistory();
    // const [time,setTime] = useState({'days': 0,'hours':0,'minutes':0,'seconds':0})

    // useEffect(() => {
    //     var countDownDate = new Date("Jan 5, 2021 15:37:25").getTime();
    //     setInterval(()=> {
    //         var now = new Date().getTime();
    //         var distance = countDownDate - now;    
    //         var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    //         var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    //         var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    //         var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    //         setTime({days,hours,minutes,seconds})
    //     },10000);
    // }, []);
    const rewards = Utils.stakingRewards(props.contract);
    const maturitySentence = Utils.rewardSentence(rewards.maturityAnnual, rewards);
    const withdrawSentence = Utils.rewardSentence(rewards.earlyWithdrawAnnual, rewards);

    const fields = [
        {
            label: 'Your staked balance',
            value: `${props.userStake?.amountInStake || ''} ${props.symbol || ''}`
        },
        {
            label: 'Staking cap',
            value: `${formatter.format(props.contract.stakingCap, false)} ${props.symbol}`,
        },
        {
            label: 'Staked so far',
            value: `${formatter.format(props.contract.stakedTotal, false)} ${props.symbol}`,
        },
        {
            label: 'Maturity reward',
            value: maturitySentence
        },
        {
            label: 'Early rewards',
            value: withdrawSentence,
        },
        {
            label: 'Staking contribution close',
            value: moment(props.contract.stakingEnds * 1000).fromNow()
        },
        {
            label: 'Early withdraw open',
            value: dataFormat(props.contract.withdrawStarts)
        },
        {
            label: 'Maturity at',
            value: dataFormat(props.contract.withdrawEnds)
        }
            
    ];

    const notConnected = !!props.contract.stakingStarts ? undefined : (
        <Row centered>
            <ThemedText.H2>{intl('connect-required')}</ThemedText.H2>
        </Row>
    );

    const contractTop = (
        <div className="contract-top">
            <div className="contract-logo">
                <img src={props.contract.logo} />
            </div>
            <div className="contract-title-box">
                <span className="contract-title" style={styles.text}>
                    {props.contract.name || ''}
                </span>
                <span className="contract-sub-title" style={styles.text}>
                    {'STAKING POOL'}
                </span>
            </div>
        </div>
    );

    const addressBox = (
        <LeftBox>
            {contractTop}
            <Gap size='small' />
            <Row >
                <ThemedText.H3>YOUR ADDRESS</ThemedText.H3>
            </Row>
            <Row >
                <ThemedText.H2 >{Utils.shorten(props.userStake?.userAddress || '')}</ThemedText.H2>
            </Row>
            <Gap size='small' />
            <Row >
                <ThemedText.H3>CONTRACT ADDRESS</ThemedText.H3>
            </Row>
            <Row >
                <ThemedText.H2 >{Utils.shorten(props.userStake?.contractAddress || '')}</ThemedText.H2>
            </Row>
            <Gap />
            <Row>
                <PrimaryButton text={props.filled ? 'Filled' : 'Stake Now'}
                    disabled={props.filled}
                    onClick={() => props.onContractSelected(
                        history,props.contract.contractAddress,false, props.groupId)}
                    />
            </Row>
        </LeftBox>
    );

    const infoBox = (
        <RightBox>
            {notConnected}
        {
        fields.map((e, i)=>
            <List key={i}
            value={e.value} label={e.label} />
        )
        }
        </RightBox>
    );
      
    return (
        <div className="main-staking-container">
        <div className="contract-container">
            {addressBox}
            {infoBox}
        </div> 
        </div>
    )
}

const themedStyles = (theme:any) => ({
    text: {
        color: theme.get(Theme.Colors.textColor),
    },
    categoryColor: {
        color: theme.get(Theme.Colors.textColor),
    },
})