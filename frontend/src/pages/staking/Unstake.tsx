import React from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import {
    Page,PageTopPart,  Row, ThemedText, Gap,InputGroupAddon,ThemedButton
    // @ts-ignore
} from 'unifyre-web-components';
import { formatter } from "../../common/Utils";

export function UnStakeComponent(props: any) {
    const history = useHistory();
    const stakeInfo = props.props.stakingData.find((e:any)=> e.contractAddress === '0x36850161766d7a1738358291b609eF02E2Ee0375')
    console.log(props,'kkkk0000');
    const {symbol,stakingCap,balance,stakedAmount} = stakeInfo;   
    // Render the routes
    let currency = props.props.address.currency;
    const data = props.props.stakingData;
    return (
        <Page>
            <PageTopPart>
                <Gap />
                <Row withPadding centered>
                    <ThemedText.H3>{`UnStake ${data[0].symbol}`}</ThemedText.H3>
                </Row>
            </PageTopPart>
            {
                <>
                  <Row withPadding centered>
                      <ThemedText.H4>{'Amount To Withdraw'}</ThemedText.H4>
                  </Row>
                  <Row withPadding>
                      <InputGroupAddon
                          value={props.props.amount}
                          onChange={props.props.onAmountToStakeChanged}
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
                          value={`${formatter.format((stakingCap - stakedAmount).toString(),true)} ${symbol}`}
                          inputMode={'decimal'}
                          disabled={true}
                      />
                  </Row>
                  <Gap/>
                  <Row withPadding>
                        <ThemedButton text={`UnStake`} onClick={()=>{props.props.stakeToken({address:'',amount:20,currency,symbol:'FRM' })}}/>
                  </Row>
              </>
            }        
        </Page>
    );
}
