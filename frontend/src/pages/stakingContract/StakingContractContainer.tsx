import React from 'react';
import {
    Page,PageTopPart,  Row, ThemedText, Gap, InputGroupAddon, ThemedButton, ThemedLink,
    // @ts-ignore
} from 'unifyre-web-components';
import { useHistory } from 'react-router-dom';
import { formatter,dataFormat } from "../../common/Utils";
import { connect } from 'react-redux';
import { StakingContract, StakingContractDispatch, StakingContractProps } from './StakingContract';
import { LoaderContainer } from '../../components/Loader';

function PreStakingView(props: StakingContractProps&StakingContractDispatch) {
    return (
        <>
        </>
    )
}

function StakingView(props: StakingContractProps&StakingContractDispatch) {
    const history = useHistory();
    const {contract, symbol} = props;
    const navigateToStakePage = (address:string) => {
        history.replace(`/stake/${address}`);
    }
    return (
        <>
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
                    disabled={props.state !== 'stake'}
                    onClick={()=>{navigateToStakePage(contract.contractAddress)}}/>
            </Row>
        </>
    )
}

function PreWithdrawView(props: StakingContractProps&StakingContractDispatch) {
    return (
        <>
        </>
    )
}

function WithdrawView(props: StakingContractProps&StakingContractDispatch) {
    return (
        <>
        </>
    )
}

function MaturityView(props: StakingContractProps&StakingContractDispatch) {
    return (
        <>
        </>
    )
}

function StakingContractComponent(props: StakingContractProps&StakingContractDispatch) {
    const history = useHistory();
    let mainPart = (<> </>);
    switch (props.state) {
        case 'pre-stake':
            mainPart = (<PreStakingView {...props} />);
            break;
        case 'stake':
            mainPart = (<StakingView {...props} />);
            break;
        case 'pre-withdraw':
            mainPart = (<PreWithdrawView {...props} />);
            break;
        case 'withdraw':
            mainPart = (<WithdrawView {...props} />);
            break;
        case 'maturity':
            mainPart = (<MaturityView {...props} />);
            break;
    }

    return (
        <Page>
            <LoaderContainer />
            <PageTopPart>
                <Gap />
                <Row withPadding centered>
                    <ThemedText.H3>{`Unifyre ${props.symbol} Staking`}</ThemedText.H3>
                </Row>
                <Row withPadding centered>
                    <ThemedText.H2>{props.contract.name}</ThemedText.H2>
                </Row>
            </PageTopPart>
            {mainPart}
            <Row withPadding centered>
                <ThemedLink text={'Go back'} onClick={() => history.replace('/')} />
            </Row>
            <Gap size={'small'}/>
        </Page>
    );
}

export const StakingContractContainer = connect(
  StakingContract.mapStateToProps, StakingContract.mapDispatchToProps)(StakingContractComponent);
