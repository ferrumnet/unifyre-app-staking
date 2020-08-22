import React from 'react';
import { connect } from 'react-redux';
import {
    Page,PageTopPart,  Row, ThemedText, Gap,InputGroupAddon,ThemedButton
    // @ts-ignore
} from 'unifyre-web-components';
import { formatter } from "../../common/Utils";
import { UnstakeToken, UnstakeTokenDispatch, UnstakeTokenProps } from './UnstakeToken';

function UnstakeTokenComponent(props: UnstakeTokenProps&UnstakeTokenDispatch) {
    // const stakeInfo = props.props.stakingData.find((e:any)=> e.contractAddress === '0x36850161766d7a1738358291b609eF02E2Ee0375')
    const {symbol, stakingCap, stakedBalance} = props.contract;   
    return (
        <Page>
            <PageTopPart>
                <Gap />
                <Row withPadding centered>
                    <ThemedText.H3>{`UnStake ${symbol}`}</ThemedText.H3>
                </Row>
            </PageTopPart>
            {
                <>
                  <Row withPadding centered>
                      <ThemedText.H4>{'Amount To Withdraw'}</ThemedText.H4>
                  </Row>
                  <Row withPadding>
                      <InputGroupAddon
                          value={props.amount}
                          onChange={props.onAmountToUnstakeChanged}
                          inputMode={'decimal'}
                          type={Number}
                      />
                  </Row>
                  <Gap size={'small'}/>
                  <Row withPadding centered>
                      <ThemedText.H4>{'Amount In Stake'}</ThemedText.H4>
                  </Row>
                  <Row withPadding>
                      <InputGroupAddon
                          value={`${formatter.format(
                              new Big(stakingCap).minus(new Big(stakedBalance)).toFixed(),true)} ${symbol}`}
                          inputMode={'decimal'}
                          disabled={true}
                      />
                  </Row>
                  <Gap/>
                  <Row withPadding>
                        <ThemedButton text={`UnStake`} onClick={()=>{props.onUnstakeToken(props)}}/>
                  </Row>
              </>
            }        
        </Page>
    );
}

export const UnstakeTokenContainer = connect(
  UnstakeToken.mapStateToProps, UnstakeToken.mapDispatchToProps)(UnstakeTokenComponent);