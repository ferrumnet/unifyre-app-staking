import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { StakingContractDispatch, StakingContractProps } from '../StakingContract';
import './staking.scss';
import {List} from '../../../components/list';
import {
    Row, ThemedText, Gap,
    // @ts-ignore
} from 'unifyre-web-components';
import { dataFormat, Utils } from '../../../common/Utils';
import { intl, Theme, ThemeContext } from 'unifyre-react-helper';
import { LeftBox, RightBox } from '../../../components/WebBoxes';
import { PrimaryButton, TextField } from '@fluentui/react';
import { StakingApp, UserStake } from '../../../common/Types';
import { StakingContractAddress, StakingContractDetails } from './StakingView';

export function WithdrawViewInfoBox(props: {contract: StakingApp,
    userStake: UserStake, unstakeRewardsNow: string, unstakeRewardsMaturity: string}) {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    const notConnected = !!props.contract.stakingStarts ? undefined : (
        <Row centered>
            <ThemedText.H2>{intl('connect-required')}</ThemedText.H2>
        </Row>
    );
    const fields = [
        {
            label: 'You staked balance',
            value: `${props.userStake?.amountInStake || '0'} ${props.contract.symbol || ''}`
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
    const maturityTracker = ((props.contract.withdrawEnds || 0) * 1000 <= Date.now()) ? undefined : (
        <Row centered>
            <span className="staking-maturity-counter" style={styles.text}>
                {tillMon || '0'} months {tillDay || '0'} days {tillHour || '0'} hours to maturity
            </span>
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
        <Gap />
        {maturityTracker}
        </RightBox>
    );
}

export function WithdrawView (props: StakingContractProps&StakingContractDispatch) {
    const history = useHistory();
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);

    const addressBox = (
        <LeftBox>
            <StakingContractDetails logo={props.contract.logo} name={props.contract.name} />
            <Gap size='small' />
            <StakingContractAddress network={props.contract.network}
                contractAddress={props.contract.contractAddress}
                userAddress={props.userStake?.userAddress}
                />
            <Gap />
            <Row>
                <PrimaryButton text={'Un-stake'}
                    disabled={props.state !== 'withdraw' && props.state !== 'maturity'}
                    onClick={() => props.onContractSelected(
                        history,props.contract.contractAddress, true, props.groupId)}
                    />
            </Row>
        </LeftBox>
    );

      
    return (
        <div className="main-staking-container">
        <div className="contract-container">
            {addressBox}
            <WithdrawViewInfoBox
                contract={props.contract}
                unstakeRewardsMaturity={props.unstakeRewardsMaturity}
                unstakeRewardsNow={props.unstakeRewardsNow}
                userStake={props.userStake || {} as any}
            />
        </div> 
        </div>
    );
}

const themedStyles = (theme:any) => ({
    text: {
        color: theme.get(Theme.Colors.textColor),
    },
})