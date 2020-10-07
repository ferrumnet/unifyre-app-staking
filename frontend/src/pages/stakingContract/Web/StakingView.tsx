import React,{useContext,useEffect,useState} from 'react';
import { useHistory } from 'react-router-dom';
import { StakingContractDispatch, StakingContractProps } from '../StakingContract';
import './staking.scss';
import {List} from '../../../components/list';
import {
    Gap, Row,
    // @ts-ignore
} from 'unifyre-web-components';
import { Header,Divider,Button} from '@fluentui/react-northstar';
import { Flex } from '@fluentui/react-northstar';
import { dataFormat, Utils } from "../../../common/Utils";
import {ThemeContext, Theme} from 'unifyre-react-helper';
import {
    ThemedText,
    // @ts-ignore
} from 'desktop-components-library';
import { PrimaryButton } from '@fluentui/react';

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

    const fields = [
       
        {
            label: 'You Have Staked',
            value: `${props.userStake?.amountInStake || ''} ${props.symbol || ''}`
        },
        {
            label: 'Rewards if un-staked today',
            value: props.unstakeRewardsNow || ''
        },
        {
            label: 'Rewards at maturity',
            value: props.unstakeRewardsMaturity || ''
        },
        {
            label: 'Early withdraw starts',
            value: dataFormat(props.contract.withdrawStarts)
        },
        {
            label: 'Maturity',
            value: dataFormat(props.contract.withdrawEnds)
        }
            
    ]
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
        <div className="staking-box address-box">
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
        </div>
    );
                            // <Button 
                            //     className="btn" 
                            //     iconPosition="before"
                            //     primary
                            //     content={
                            //         props.filled ? 'Filled' :
                            //             props.userStake?.amountInStake === '0' ? `Start Winning` : `Stake More ${props.symbol}`}
                            //     
                            //     disabled={props.filled}
                            // />

    const infoBox = (
        <div className="staking-box info-box">
        {
        fields.map((e, i)=>
            <List key={i} value={
                    <span className={e.value.length > 10 ? 'staking-info-small-val' : 'staking-info-val'}
                        style={styles.text}>{e.value || ''}</span>
                }
                label={
                    <span 
                        style={styles.text}>{e.label || ''}
                    </span>}/>
        )
        }
        </div>
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