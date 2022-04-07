import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
    Row, ThemedText, Gap, ErrorMessage,
    // @ts-ignore
} from 'unifyre-web-components';
import { formatter } from "../../common/Utils";
import { LoaderContainer } from '../../components/Loader';
import './stake.scss';
import { UnstakeToken, UnstakeTokenDispatch, UnstakeTokenProps } from './UnstakeToken';
import { LeftBox } from '../../components/WebBoxes';
import { PrimaryButton, TextField } from '@fluentui/react';
import { WithdrawViewInfoBox } from '../stakingContract/Web/WithdrawView';

function UnstakeTokenComponent(props: UnstakeTokenProps&UnstakeTokenDispatch) {
    const history = useHistory();

    const error = props.error ? (
        <Row withPadding>
            <ErrorMessage text={props.error} />
        </Row>
    ) : undefined;

    const takeRewards = props.contract.rewardContinuationAddress ? (
        <>
            <span>&nbsp;</span> 
            <PrimaryButton
                text={'Take Rewards Only'}
                onClick ={()=> props.onTakeRewards(history as any, props)}
            />
        </>
    ) : undefined;
    const extraNotes = props.contract.rewardContinuationAddress ? 
        props.contract.rewardContinuationParagraph ? (
            <Row>
                <p>{props.contract.rewardContinuationParagraph}</p>
            </Row>
        ) : (
            <Row>
            <p>This staking supports rewards continuation. <br/>
            If you unstake you get the current rewards but you will NOT get any future rewards. <br/>
            Alternatively you can just take rewards and keep your original staked amount to qualify
            for future rewards.
            </p>
            </Row>
        ) : undefined;

    const inputBox = (
        <LeftBox>
            <Row>
                <ThemedText.H3>{'AMOUNT TO UN-STAKE'}</ThemedText.H3>
            </Row>
            <Row>
                <TextField
                    onChange={(e, v) => props.onAmountToUnstakeChanged(v || '')}
                    value={props.amount}
                    suffix={props.symbol || ''}/>
            </Row>
            <Row>
                <ThemedText.H3>{'STAKED BALANCE'}</ThemedText.H3>
            </Row>
            <Row>
                <TextField
                    value={`${formatter.format(props.stakedAmount || '0', false)} ${props.symbol || ''}`}
                    readOnly={true}
                    disabled={true}
                    />
            </Row>
            {error}
            <Row>
                <PrimaryButton
                    text={'Un-stake'}
                    disabled={!props.userAddress || (
                        props.state !== 'withdraw' && props.state !== 'maturity')}
                    onClick ={()=> props.onUnstakeToken(history as any,props)}
                />
                {takeRewards}
            </Row>
            {extraNotes}
        </LeftBox>
    );

    const infoBox = (
        <WithdrawViewInfoBox
            contract={props.contract}
            unstakeRewardsMaturity={props.unstakeRewardsMaturity}
            unstakeRewardsNow={props.unstakeRewardsNow}
            userStake={props.userStake || {} as any}
            isZeroReward={props.isRewardZero}
        />
    );

    return (
        <>
            <LoaderContainer />
            <Gap/>
            <div className="main-staking-container">
            <div className="contract-container">
                {inputBox}
                {infoBox}
            </div> 
            </div>
            <Gap/>
            <Gap/>
            <Gap/>
        </>
    );
}

export const UnstakeTokenContainer = connect(
    UnstakeToken.mapStateToProps, UnstakeToken.mapDispatchToProps)(UnstakeTokenComponent);
    