import React from 'react';
import {
    Page,PageTopPart,  Row, ThemedText, Gap,InputGroupAddon,ThemedButton
    // @ts-ignore
} from 'unifyre-web-components';
import { useHistory } from 'react-router-dom';
import { formatter,dataFormat } from "../../common/Utils";
import { connect } from 'react-redux';
import { StakingContract, StakingContractDispatch, StakingContractProps } from './StakingContract';
import { LoaderContainer } from '../../components/Loader';

function StakingContractComponent(props: StakingContractProps&StakingContractDispatch) {
    // const stakeInfo = props.find((e:any)=> e.contractAddress === '0x36850161766d7a1738358291b609eF02E2Ee0375')
    // Render the routes
    const history = useHistory();
    const {contract, symbol} = props;
    var utcSeconds = contract.stakingStarts;
    var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    d.setUTCSeconds(utcSeconds);

    const navigateToInfoPage = (address:string) => {
        history.replace(`/stake/${address}`);
    }

    return (
        <Page>
            <LoaderContainer />
            <PageTopPart>
                <Gap />
                <Row withPadding centered>
                    <ThemedText.H3>{`Unifyre ${symbol} Staking`}</ThemedText.H3>
                </Row>
                <Row withPadding centered>
                    <ThemedText.H2>{contract.name}</ThemedText.H2>
                </Row>
            </PageTopPart>
            <Row withPadding>
                <ThemedText.SMALL>{'Total staking Amount'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={`${formatter.format(contract.stakingCap, false)} ${symbol}`}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Staked so far:'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={`${formatter.format(props.stakedAmount,true)} ${props.symbol}`}
                    inputMode={'decimal'}
                    disabled={true}

                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{`Your Available ${symbol} balance :`}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={`${formatter.format(props.balance,false)} ${symbol}`}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Staking Starts'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={dataFormat(contract.stakingStarts)}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Staking Ends'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={dataFormat(contract.stakingEnds)}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Early Withdrawal Starts'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={dataFormat(contract.withdrawStarts)}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Withdrawal Ends'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={dataFormat(contract.withdrawEnds)}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Gap />
            <Row withPadding>
                <ThemedButton
                    text={`Stake ${symbol}`}
                    onClick={()=>{navigateToInfoPage(contract.contractAddress)}}/>
            </Row>
            <Row withPadding>
                <ThemedButton text={'Return'}/>
            </Row>
            <Gap size={'small'}/>
        </Page>
    );
}

export const StakingContractContainer = connect(
  StakingContract.mapStateToProps, StakingContract.mapDispatchToProps)(StakingContractComponent);
