import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { StakingContractDispatch, StakingContractProps } from '../StakingContract';
import './staking.scss';
import {List} from '../../../components/list';
import {
    Row, ThemedText, Gap,InputGroupAddon,ThemedButton
    // @ts-ignore
} from 'unifyre-web-components';
import { dataFormat, Utils } from '../../../common/Utils';
import { Theme, ThemeContext } from 'unifyre-react-helper';
import { LeftBox, RightBox } from '../../../components/WebBoxes';
import { PrimaryButton } from '@fluentui/react';

export function WithdrawView (props: StakingContractProps&StakingContractDispatch) {
    const history = useHistory();
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);

    const fields = [
       
        {
            label: 'You Have Staked',
            value: `${props.userStake?.amountInStake || '0'} ${props.symbol || ''}`
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
    const [tillMon, tillDay, tillHour] = Utils.tillDate(props.contract.withdrawEnds);

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
                <PrimaryButton text={'Un-stake'}
                    disabled={props.state !== 'withdraw'}
                    onClick={() => props.onContractSelected(
                        history,props.contract.contractAddress, true, props.groupId)}
                    />
            </Row>
        </LeftBox>
    );

    const infoBox = (
        <RightBox>
        {
        fields.map((e, i)=>
            <List key={i}
            value={e.value} label={e.label} />
        )
        }
        <Gap />
        <Row centered>
            <span className="staking-maturity-counter" style={styles.text}>
                {tillMon || '0'} months {tillDay || '0'} days {tillHour || '0'} hours to maturity
            </span>
        </Row>
        </RightBox>
    );
      
    return (
        <div className="main-staking-container">
        <div className="contract-container">
            {addressBox}
            {infoBox}
        </div> 
        </div>
    );
}

const themedStyles = (theme:any) => ({
    text: {
        color: theme.get(Theme.Colors.textColor),
    },
})