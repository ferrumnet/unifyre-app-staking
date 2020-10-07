import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
    Row, ThemedText, Gap, ErrorMessage,
    // @ts-ignore
} from 'unifyre-web-components';
import { formatter } from "../../common/Utils";
import { Big } from 'big.js';
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
                    onClick ={()=> props.onUnstakeToken(history,props)}
                />
            </Row>
        </LeftBox>
    );


    const infoBox = (
        <WithdrawViewInfoBox
            contract={props.contract}
            unstakeRewardsMaturity={props.unstakeRewardsMaturity}
            unstakeRewardsNow={props.unstakeRewardsNow}
            userStake={props.userStake || {} as any}
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
    