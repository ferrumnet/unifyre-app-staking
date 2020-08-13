import React from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import {
    Page,PageTopPart,  Row, ThemedText, Gap,InputGroupAddon,ThemedButton
    // @ts-ignore
} from 'unifyre-web-components';

export function StakeComponent(props: any) {
    const history = useHistory();
    const stakeInfo = props.props.stakingData.find((e:any)=> e.contractAddress === '0x36850161766d7a1738358291b609eF02E2Ee0375')

    const {symbol,stakingCap,balance,stakedAmount} = stakeInfo;   
    // Render the routes
    let currency = props.props.address.currency;
    console.log(props,'====?>>>>>',currency)
    const data = props.props.stakingData;
    return (
        <Page>
            <PageTopPart>
                <Gap />
                <Row withPadding centered>
                    <ThemedText.H3>{`Stake ${data[0].symbol}`}</ThemedText.H3>
                </Row>
            </PageTopPart>
            {
                <>
                  <Row withPadding centered>
                      <ThemedText.H4>{'Amount To Stake'}</ThemedText.H4>
                  </Row>
                  <Row withPadding>
                      <InputGroupAddon
                          value={stakingCap}
                          onChange={props.onTotalAmountChanged}
                          inputMode={'decimal'}
                          
                      />
                  </Row>
                  <Gap size={'small'}/>
                  <Row withPadding centered>
                      <ThemedText.H4>{'Available Balance'}</ThemedText.H4>
                  </Row>
                  <Row withPadding>
                      <InputGroupAddon
                          value={balance}
                          onChange={props.onTotalAmountChanged}
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
                          value={stakingCap - stakedAmount}
                          onChange={props.onTotalAmountChanged}
                          inputMode={'decimal'}
                          disabled={true}
                      />
                  </Row>
                  <Gap/>
                  <Row withPadding>
                        <ThemedButton text={`Submit Stake`} onClick={()=>{props.props.stakeToken({address:'',amount:20,currency })}}/>
                  </Row>
              </>
            }        
        </Page>
    );
}
