import React from 'react';
import {
    Page,PageTopPart,  Row, ThemedText, Gap,InputGroupAddon,ThemedButton
    // @ts-ignore
} from 'unifyre-web-components';
import { Switch, Route, useHistory } from 'react-router-dom';

export function StakingComponent(props: any) {
    const stakeInfo = props.props.find((e:any)=> e.contractAddress === '0x36850161766d7a1738358291b609eF02E2Ee0375')
    const {symbol,stakingCap,stakingStarts,withdrawStarts,stakingEnds,withdrawEnds,stakedAmount,contractAddress} = stakeInfo;        
    // Render the routes
    console.log(stakeInfo);
    const history = useHistory();

    const navigateToInfoPage = (address:string) => {
        history.replace(`/stake/${address}`);
    }

    return (
        <Page>
            <PageTopPart>
                <Gap />
                <Row withPadding centered>
                    <ThemedText.H3>{`Unifyre ${symbol} Staking`}</ThemedText.H3>
                </Row>
                <Row withPadding centered>
                    <ThemedText.H2>{props.symbol}</ThemedText.H2>
                </Row>
            </PageTopPart>
            <Row withPadding centered>
                <ThemedText.H3>{stakeInfo.tokenName}</ThemedText.H3>
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Total staking Amount'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={stakingCap}
                    onChange={props.onTotalAmountChanged}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Staked so far:'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={stakedAmount.toString()}
                    onChange={props.onTotalAmountChanged}
                    inputMode={'decimal'}
                    disabled={true}

                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{`Your Available ${symbol} balance :`}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={stakedAmount.toString()}
                    onChange={props.onTotalAmountChanged}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Staking Starts'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={stakingStarts}
                    onChange={props.stakingStarts}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Staking Ends'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={stakingEnds}
                    onChange={props.stakingEnds}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Early Withdrawal Starts'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={withdrawStarts}
                    onChange={props.withdrawalEnds}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Withdrawal Ends'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={withdrawEnds}
                    onChange={props.withdrawalEnds}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Gap />
            <Row withPadding>
                <ThemedButton text={`stake ${symbol}`} onClick={()=>{navigateToInfoPage(contractAddress)}}/>
            </Row>
            <Row withPadding>
                <ThemedButton text={'Return'}/>
            </Row>
            <Gap size={'small'}/>
        </Page>
    );
}
