import React from 'react';
import { connect } from 'react-redux';
import {
    Page,PageTopPart,  Row, ThemedText, Gap,InputGroupAddon,ThemedButton
    // @ts-ignore
} from 'unifyre-web-components';
import { formatter } from "../../common/Utils";
import { StakeToken, StakeTokenDispatch, StakeTokenProps } from './StakeToken';
import { Big } from 'big.js';
import { useHistory } from 'react-router-dom';

function StakeTokenComponent(props: StakeTokenProps&StakeTokenDispatch) {
    const {symbol, stakingCap} = props.contract;   
    const history = useHistory();
    const {balance} = props;
    return (
        <Page>
            <PageTopPart>
                <Gap />
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
                      <InputGroupAddon
                          value={props.amount}
                          onChange={props.onAmountToStakeChanged}
                          inputMode={'decimal'}
                          type={Number}
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
                              new Big(stakingCap).minus(new Big(props.stakedAmount)).toFixed(),true)} ${symbol}`}
                          inputMode={'decimal'}
                          disabled={true}
                      />
                  </Row>
                  <Gap/>
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