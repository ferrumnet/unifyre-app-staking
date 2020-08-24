import React from 'react';
import { connect } from 'react-redux';
import {
    Page,PageTopPart,  Row, ThemedText, Gap, InputCurrency, ThemedButton, ErrorMessage,
    InputGroupAddon,
    // @ts-ignore
} from 'unifyre-web-components';
import { formatter } from "../../common/Utils";
import { StakeToken, StakeTokenDispatch, StakeTokenProps } from './StakeToken';
import { Big } from 'big.js';
import { useHistory } from 'react-router-dom';
import { LoaderContainer } from '../../components/Loader';

function StakeTokenComponent(props: StakeTokenProps&StakeTokenDispatch) {
    const {name, symbol, stakingCap} = props.contract;   
    const history = useHistory();
    const {balance} = props;
    const error = props.error ? (
        <Row withPadding>
            <ErrorMessage text={props.error} />
        </Row>
    ) : undefined;
    return (
        <Page>
            <LoaderContainer />
            <PageTopPart>
                <Gap />
                <Row withPadding centered>
                    <ThemedText.H3>{name}</ThemedText.H3>
                </Row>
                <Row withPadding centered>
                    <ThemedText.H3>{`Stake ${symbol}`}</ThemedText.H3>
                </Row>
            </PageTopPart>
            {
                <>
                  <Row withPadding centered>
                      <ThemedText.H4>{'Amount To Stake'}</ThemedText.H4>
                  </Row>
                  <Row withPadding>
                    <InputCurrency
                        currencies={[{ label: props.symbol, key: props.symbol }]}
                        amountStr={props.amount}
                        onAmountChanged={props.onAmountToStakeChanged}
                        curreny={symbol}
                        onCurrencyChanged={() => { }}
                        autoFocus={true}
                        formatter={formatter}
                        inputMode={'decimal'}
                    />
                  </Row>
                  <Gap size={'small'}/>
                  <Row withPadding centered>
                      <ThemedText.H4>{'Available Balance'}</ThemedText.H4>
                  </Row>
                  <Row withPadding>
                      <InputGroupAddon
                          value={`${formatter.format(balance,false)} ${symbol}`}
                          inputMode={'decimal'}
                          disabled={true}
                      />
                  </Row>
                  <Gap size={'small'}/>
                  <Row withPadding centered>
                      <ThemedText.H4>{'Amount Remaining in Stake'}</ThemedText.H4>
                  </Row>
                  <Row withPadding>
                      <InputGroupAddon
                          value={`${formatter.format(
                              new Big(stakingCap || '0').minus(new Big(props.stakedAmount || '0')).toFixed(),true)} ${symbol}`}
                          inputMode={'decimal'}
                          disabled={true}
                      />
                  </Row>
                  <Gap/>
                  {error}
                  <Row withPadding>
                        <ThemedButton
                            text={`Sign and Submit Stake`}
                            onClick={()=>{
                                props.onStakeToken(history, props)}}/>
                  </Row>
              </>
            }        
        </Page>
    );
}

export const StakeTokenContainer = connect(
  StakeToken.mapStateToProps, StakeToken.mapDispatchToProps)(StakeTokenComponent);