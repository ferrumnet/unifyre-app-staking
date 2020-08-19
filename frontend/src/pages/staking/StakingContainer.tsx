import React from 'react';
import {
    Page,PageTopPart,  Row, ThemedText, Gap,InputGroupAddon,ThemedButton
    // @ts-ignore
} from 'unifyre-web-components';
import { useHistory } from 'react-router-dom';
import { formatter,dataFormat } from "../../common/Utils";

export function StakingComponent(props: any) {
    const stakeInfo = props.props.find((e:any)=> e.contractAddress === '0x36850161766d7a1738358291b609eF02E2Ee0375')
    const {symbol,stakingCap,stakingStarts,withdrawStarts,stakingEnds,withdrawEnds,stakedAmount,contractAddress,balance} = stakeInfo;        
    // Render the routes
    const history = useHistory();
    var utcSeconds = stakingStarts;
    var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    d.setUTCSeconds(utcSeconds);
    console.log(d);
    

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
                    onChange={`${formatter.format('0',false)} ${symbol}`}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Staked so far:'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={formatter.format(stakedAmount,true)?.toString()}
                    inputMode={'decimal'}
                    disabled={true}

                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{`Your Available ${symbol} balance :`}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={`${formatter.format(balance,false)?.toString()} ${symbol}`}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Staking Starts'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={dataFormat(stakingStarts)}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Staking Ends'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={dataFormat(stakingEnds)}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Early Withdrawal Starts'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={dataFormat(withdrawStarts)}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Withdrawal Ends'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={dataFormat(withdrawEnds)}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Gap />
            <Row withPadding>
                <ThemedButton text={`Stake ${symbol}`} onClick={()=>{navigateToInfoPage(contractAddress)}}/>
            </Row>
            <Row withPadding>
                <ThemedButton text={'Return'}/>
            </Row>
            <Gap size={'small'}/>
        </Page>
    );
}
