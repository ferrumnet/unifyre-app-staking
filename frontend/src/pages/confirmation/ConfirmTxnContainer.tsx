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
                requestId={Utils.getQueryparam('continuation')}
                network={props.stakeEvent?.network}
                onLoad={props.onLoad}
                txIds={[...(props.stakeEvent?.approveTxIds || []), props.stakeEvent?.mainTxId].filter(Boolean)}
                okButtonText={props.action === 'stake' ? 'Stake more' : 'Check other opportunities'}
                okButtonUrl={`/info/${props.stakeEvent?.contractAddress}`}
                backButtonUrl={props.stakeEvent ? `/info/${props.stakeEvent?.contractAddress}` : '/'}
                onRefresh={() => props.onRefresh(props)}
                transactionStatus={props.stakeEvent?.transactionStatus || ''}
                successMessage={`You have ${props.action}ed ${
                    formatter.format(props.amount, false)} ${props.stakeEvent?.symbol || ''}`}
                error={props.error}
            />
        </Page>
    );
}

export const ConfirmTxnContainer = connect(
    ConfirmTxn.mapStateToProps, ConfirmTxn.mapDispatchToProps)(ConfirmationComponent);
