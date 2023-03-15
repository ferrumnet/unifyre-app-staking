import React,{useContext, useState} from 'react';
import { useHistory } from 'react-router-dom';
import { StakingContractDispatch, StakingContractProps } from '../StakingContract';
import './staking.scss';
import {List} from '../../../components/list';
import {
    Gap, Row,
    // @ts-ignore
} from 'unifyre-web-components';
import { dataFormat, formatter, remappedNetwork, Utils } from "../../../common/Utils";
import {ThemeContext, Theme, intl} from 'unifyre-react-helper';
import {
    ThemedText,
    // @ts-ignore
} from 'desktop-components-library';
import { PrimaryButton, TextField } from '@fluentui/react';
import { LeftBox, RightBox } from '../../../components/WebBoxes';
import moment from 'moment';
import { StakingApp, UserStake } from '../../../common/Types';

export function StakingContractDetails(props: {logo?: string, name?: string,}) {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    return (
        <div className="contract-top">
            <div className="contract-logo">
                <img src={props.logo} />
            </div>
            <div className="contract-title-box">
                <span className="contract-title" style={styles.text}>
                    {props.name || ''}
                </span>
                <span className="contract-sub-title" style={styles.text}>
                    {'STAKING POOL'}
                </span>
            </div>
        </div>
    );
}

export function StakingContractAddress(props: {
    network: string, userAddress?: string, contractAddress?: string,
    rewardContinuationAddress?: string,
}) {
    const [showAddress, setShowAddress] = useState(false);
    const rewCon = props.rewardContinuationAddress ? (
        <>
            <Gap size='small' />
            <Row >
                <ThemedText.H3>REWARD CONTINUATION ADDRESS</ThemedText.H3>
            </Row>
            <Row >
                <TextField 
                underlined
                value={props.rewardContinuationAddress}
                readOnly
                suffix={'🔗'}
                onClick={() => props.rewardContinuationAddress &&
                    window.open(Utils.linkForAddress(props.network, props.rewardContinuationAddress!))}
                />
            </Row>
        </>
    ) : undefined;
    return (
        <>
            <Row >
                <ThemedText.H3>CONNECTED TO <b>{remappedNetwork(props.network)?.identifier || props.network}</b> NETWORK</ThemedText.H3>
            </Row>
            <Gap size='small' />
            <Row >
                <ThemedText.H3>YOUR ADDRESS</ThemedText.H3>
            </Row>
            <Row >
                <TextField 
                underlined
                value={props.userAddress}
                readOnly
                suffix={'🔗'}
                onClick={() => props.userAddress && window.open(Utils.linkForAddress(props.network, props.userAddress!))}
                />
            </Row>
            {showAddress && (
                <>
            <Gap size='small' />
            <Row >
                <ThemedText.H3>CONTRACT ADDRESS</ThemedText.H3>
            </Row>
            <Row >
                <TextField 
                underlined
                value={props.contractAddress}
                readOnly
                suffix={'🔗'}
                onClick={() => props.contractAddress && window.open(Utils.linkForAddress(props.network, props.contractAddress!))}
                />
            </Row>
            {rewCon}
            <Row >
                <small className="error">NEVER SEND TOKENS TO THE CONTRACT, THEY WILL BE LOCKED FOREVER. ONLY USE THIS UI TO STAKE.</small>
            </Row>
                </>
            )}
            <Gap size='small' />
            <Row>
                <a onClick={() => setShowAddress(!showAddress)}>
                    <ThemedText.H4>{showAddress ? 'HIDE CONTRACT ADDRESS' : 'SHOW CONTRACT ADDRESS'}</ThemedText.H4>
                </a>
            </Row>
        </>
    );
}

export function StakingRight(props: {contract: StakingApp, userStake?: UserStake}) {
    const rewards = Utils.stakingRewards(props.contract);
    const maturitySentence = Utils.rewardSentence(rewards.maturityAnnual, rewards);
    const withdrawSentence = Utils.rewardSentence(rewards.earlyWithdrawAnnual, rewards);

    const fields = [
        {
            label: 'Your staked balance',
            value: `${props.userStake?.amountInStake || ''} ${props.contract.symbol || ''}`
        },
        {
            label: 'Staking cap',
            value: `${formatter.format(props.contract.stakingCap, false)} ${props.contract.symbol}`,
        },
        {
            label: 'Staked so far',
            value: `${formatter.format(props.contract.stakedTotal, false)} ${props.contract.symbol}`,
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

    return (
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
}

export function StakingView (props: StakingContractProps&StakingContractDispatch) {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    
    const history = useHistory();
    const btn = props.state !== 'pre-stake' ? (
        <Row>
            <PrimaryButton text={props.filled ? 'Filled' : 'Stake Now'}
                disabled={props.filled}
                onClick={() => props.onContractSelected(
                    history as any,props.contract.network,props.contract.contractAddress,false, props.groupId)}
                />
        </Row>
    ) : (
        <>
            <Row>
                <ThemedText.H3>STAKING OPENS</ThemedText.H3>
            </Row>
            <Row >
                <ThemedText.H2 >{
                           moment(props.contract.stakingStarts * 1000).fromNow() 
                }</ThemedText.H2>
            </Row>
        </>
    );

    const addressBox = (
        <LeftBox>
            <StakingContractDetails logo={props.contract.logo} name={props.contract.name}  />
            <Gap size='small' />
            <StakingContractAddress network={props.contract.network}
                contractAddress={props.contract.contractAddress}
                userAddress={props.userAddress}
                />
            <Gap />
            {btn}
        </LeftBox>
    );

      
    return (
        <div className="main-staking-container">
        <div className="contract-container">
            {addressBox}
            <StakingRight contract={props.contract} userStake={props.userStake} />
        </div> 
        </div>
    );
}

const themedStyles = (theme:any) => ({
    text: {
        color: theme.get(Theme.Colors.textColor),
    },
    categoryColor: {
        color: theme.get(Theme.Colors.textColor),
    },
})