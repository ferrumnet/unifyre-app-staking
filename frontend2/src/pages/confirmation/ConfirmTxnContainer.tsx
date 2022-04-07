import React from 'react';
import { connect } from 'react-redux';
import { ConfirmationDispatch, ConfirmationProps, ConfirmTxn } from './ConfirmTxn';
import {
    Page, TransactionContinuation, PageTopPart, ThemedText, Row,
    //@ts-ignore
} from 'unifyre-web-components';
import { formatter, Utils } from '../../common/Utils';

function ConfirmationComponent(props: ConfirmationProps&ConfirmationDispatch) {
    const successMsg = props.stakeEvent?.type === 'unstake' ? (
        `You have un-staked ${
                    formatter.format(props.amount, false)} ${props.stakeEvent?.symbol || ''} plus ${
                    formatter.format(props.rewardAmount || '0', false)} ${
                        props.stakeEvent?.rewardSymbol || props.stakeEvent?.symbol || ''} rewards`
    ) : (
        `You have ${props.action}d ${
                    formatter.format(props.amount, false)} ${props.stakeEvent?.symbol || ''}`
    );
    const gidPrefix = props.groupId ? `/${props.groupId}` : '';
    console.log(props,'propspspsp')
    return (
        <Page>
            <PageTopPart>
                <Row centered><ThemedText.H2>{`Staking`}</ThemedText.H2></Row>
            </PageTopPart>
            <TransactionContinuation
                requestId={Utils.getQueryparam('continuation')}
                network={props.stakeEvent?.network}
                onLoad={props.onLoad}
                txIds={[...(props.stakeEvent?.approveTxIds || []), props.stakeEvent?.mainTxId].filter(Boolean)}
                okButtonText={props.action === 'stake' ? 'Stake more' : 'Check other opportunities'}
                okButtonUrl={`${gidPrefix}/info/${props.stakeEvent?.contractAddress}`}
                backButtonUrl={props.stakeEvent ? `${gidPrefix}/info/${props.stakeEvent?.contractAddress}` : `${gidPrefix}/`}
                onRefresh={() => props.onRefresh(props)}
                transactionStatus={props.stakeEvent?.transactionStatus || ''}
                successMessage={successMsg}
                error={props.error}
            />
        </Page>
    );
}

export const ConfirmTxnContainer = connect(
    ConfirmTxn.mapStateToProps, ConfirmTxn.mapDispatchToProps)(ConfirmationComponent);
