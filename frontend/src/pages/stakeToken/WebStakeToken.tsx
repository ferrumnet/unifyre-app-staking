import React, {useContext} from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
    Row, ThemedText, Gap, ErrorMessage
    // @ts-ignore
} from 'unifyre-web-components';
import { dataFormat,formatter } from "../../common/Utils";
import { StakeToken, StakeTokenDispatch, StakeTokenProps } from './StakeToken';
import { Big } from 'big.js';
import { LoaderContainer } from '../../components/Loader';
import './stake.scss';
import {List} from '../../components/list';
import { LeftBox, RightBox } from '../../components/WebBoxes';
import { PrimaryButton, TextField } from '@fluentui/react';

function StakeTokenComponent(props: StakeTokenProps&StakeTokenDispatch) {
    const history = useHistory();
    

    const fields = [
       
        {
            label: 'You Have Staked',
            value: `${props.userStake?.amountInStake || ''} ${props.symbol || ''}`
        },
        {
            label: 'Rewards if un-staked today',
            value: props.unstakeRewardsNow
        },
        {
            label: 'Rewards at maturity',
            value: props.unstakeRewardsMaturity
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

    const error = props.error ? (
        <Row withPadding>
            <ErrorMessage text={props.error} />
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
            <Row>
                <PrimaryButton
                    text={'Submit stake'}
                    onClick ={()=> props.onStakeToken(history,props)}
                />
            </Row>
        </LeftBox>
    );

    const infoBox = (
        <RightBox>
            {
                fields.map((e, i)=>
                    <List key={i} value={e.value || ''} label={e.label}/>
                )
            }
        </RightBox>
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

export const StakeTokenContainer = connect(
  StakeToken.mapStateToProps, StakeToken.mapDispatchToProps)(StakeTokenComponent);
