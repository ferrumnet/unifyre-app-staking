import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
    Page,PageTopPart,  Row, ThemedText, Gap, ThemedButton
    // @ts-ignore
} from 'unifyre-web-components';
import { Main, MainDispatch, MainProps } from './Main';

function MainComponent(props: MainProps&MainDispatch) {
    const history = useHistory();

    return (
        <Page>
            <PageTopPart>
                <Gap />
                <Row withPadding centered>
                    <ThemedText.H3>{`Unifyre ${props.symbol} Staking`}</ThemedText.H3>
                </Row>
                <Row withPadding centered>
                    <ThemedText.H2>{props.symbol}</ThemedText.H2>
                </Row>
            </PageTopPart>
            <Row withPadding centered>
                <ThemedText.H3>{'Available Staking Opportunities'}</ThemedText.H3>
            </Row>
            {
                props.stakings.map( (staking, idx) =>
                    <React.Fragment key={idx}>
                        <Gap size={'small'}/>
                        <Row withPadding>
                            <ThemedButton
                                text={`${staking.symbol}`}
                                onClick={() => props.onContractSelected(history, staking, props.userAddress)}
                            />
                        </Row>
                    </React.Fragment>
                )
            }        
        </Page>
    );
}

export const MainContainer = connect(
  Main.mapStateToProps, Main.mapDispatchToProps)(MainComponent);