import React from 'react';
import { connect } from 'react-redux';
import { ConfirmationDispatch, ConfirmationProps, ConfirmTxn } from './ConfirmTxn';
import {
    Page, TransactionContinuation, PageTopPart, ThemedText, Row,
    //@ts-ignore
} from 'unifyre-web-components';
import { formatter, Utils } from '../../common/Utils';

function ConfirmationComponent(props: ConfirmationProps&ConfirmationDispatch) {
    return (
        <Page>
            <PageTopPart>
                <Row centered><ThemedText.H2>{`Staking`}</ThemedText.H2></Row>
            </PageTopPart>
            <TransactionContinuation
                requestId={Utils.getQueryparam('requestId')}
                network={props.stakeEvent?.network}
                onLoad={props.onLoad}
                txIds={[props.stakeEvent?.approveTxIds, props.stakeEvent?.mainTxId].filter(Boolean)}
                okButtonText={props.action === 'stake' ? 'Stake more' : 'Check other opportunities'}
                okButtonUrl={`/info/${props.stakeEvent?.contractAddress}`}
                backButtonUrl={`/info/${props.stakeEvent?.contractAddress}`}
                onRefresh={props.onRefresh}
                transactionStatus={props.stakeEvent?.transactionStatus || ''}
                successMessage={`You have ${props.action}ed ${
                    formatter.format(props.amount, false)} ${props.stakeEvent?.symbol || ''}`}
            />
        </Page>
    );
}

export const ConfirmTxnContainer = connect(
    ConfirmTxn.mapStateToProps, ConfirmTxn.mapDispatchToProps)(ConfirmationComponent);
