import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
    Row, ThemedText, Gap, ErrorMessage
    // @ts-ignore
} from 'unifyre-web-components';
import { formatter } from "../../common/Utils";
import { StakeToken, StakeTokenDispatch, StakeTokenProps } from './StakeToken';
import { Big } from 'big.js';
import { LoaderContainer } from '../../components/Loader';
import './stake.scss';
import { LeftBox } from '../../components/WebBoxes';
import { PrimaryButton, TextField } from '@fluentui/react';
import { StakingRight } from '../stakingContract/Web/StakingView';

function StakeTokenComponent(props: StakeTokenProps&StakeTokenDispatch) {
    const history = useHistory();
    

    const error = props.error ? (
        <Row withPadding>
            <ErrorMessage text={props.error} />
        </Row>
    ) : undefined;

    const whitelisted = (!!props.contract.emailWhitelist || !!props.contract.addressWhitelist) ? (
        <Row withPadding centered>
            <ThemedText.H3>You must be on the whitelist to stake in this contract</ThemedText.H3>
        </Row>
    ) : undefined;

    const inputBox = (
        <LeftBox>
            <Row>
                <ThemedText.H3>{'AMOUNT TO STAKE'}</ThemedText.H3>
            </Row>
            <Row>
                <TextField
                    onChange={(e, v) => props.onAmountToStakeChanged(v || '')}
                    value={props.amount}
                    suffix={props.symbol || ''}/>
            </Row>
            <Row>
                <ThemedText.H3>{'AVAILABLE BALANCE'}</ThemedText.H3>
            </Row>
            <Row>
                <TextField
                    value={`${formatter.format(props.balance || '0', false)} ${props.symbol || ''}`}
                    readOnly={true}
                    disabled={true}
                    />
            </Row>
            <Row>
                <ThemedText.H3>{'REMAINING FROM CAP'}</ThemedText.H3>
            </Row>
            <Row>
                <TextField
                    value={`${formatter.format(
                    new Big(props.contract.stakingCap || '0').minus(new Big(props.contract.stakedTotal || '0')).toFixed(),true)} ${props.symbol || ''}`}
                    readOnly={true}
                    disabled={true}
                    />
            </Row>
            {error}
            {whitelisted}
            <Row>
                <PrimaryButton
                    text={'Submit stake'}
                    onClick ={()=> props.onStakeToken(history,props)}
                />
            </Row>
        </LeftBox>
    );

    return (
        <>
            <LoaderContainer />
            <Gap/>
            <div className="main-staking-container">
            <div className="contract-container">
                {inputBox}
                <StakingRight contract={props.contract} userStake={props.userStake} />
            </div> 
            </div>
            <Gap/>
            <Gap/>
            <Gap/>
        </>
    );
}

export const StakeTokenContainer = connect(
  StakeToken.mapStateToProps, StakeToken.mapDispatchToProps)(StakeTokenComponent);
