import React from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import {
    Page,PageTopPart,  Row, ThemedText, Gap,InputGroupAddon,ThemedButton
    // @ts-ignore
} from 'unifyre-web-components';

export function MainComponent(props: any) {
    const history = useHistory();

    const navigateToInfoPage = (address:string) => {
        history.replace(`/info/${address}`);
    }

    const {symbol,stakingCap,stakingStarts,withdrawStarts,stakingEnds,withdrawEnds,stakedAmount} = props.props;        
    // Render the routes
    const data = props.props;
    return (
        <Page>
            <PageTopPart>
                <Gap />
                <Row withPadding centered>
                    <ThemedText.H3>{`Unifyre ${data[0].symbol} Staking`}</ThemedText.H3>
                </Row>
                <Row withPadding centered>
                    <ThemedText.H2>{props.symbol}</ThemedText.H2>
                </Row>
            </PageTopPart>
            <Row withPadding centered>
                <ThemedText.H3>{'Available Staking Opportunities'}</ThemedText.H3>
            </Row>
            {
                data.map((e:any) =>
                    <>
                        <Gap size={'small'}/>
                        <Row withPadding>
                            <ThemedButton text={`${e.tokenName}`} onClick={()=>navigateToInfoPage(e.contractAddress)}/>
                        </Row>
                    </>
                )
            }        
        </Page>
    );
}
