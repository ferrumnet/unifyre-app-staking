import React, {useContext} from 'react';
import { connect } from 'react-redux';
import {
    Page,PageTopPart,  Row, ThemedText, Gap,InputGroupAddon,ThemedButton, InputCurrency, ErrorMessage,
    // @ts-ignore
} from 'unifyre-web-components';
import { formatter } from "../../common/Utils";
import { LoaderContainer } from '../../components/Loader';
import { UnstakeToken, UnstakeTokenDispatch, UnstakeTokenProps } from './UnstakeToken';
import { useHistory } from 'react-router-dom';
import {ThemeContext} from 'unifyre-react-helper';


function UnstakeTokenComponent(props: UnstakeTokenProps&UnstakeTokenDispatch) {
    const history = useHistory();
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    const error = props.error ? (
        <Row withPadding>
            <ErrorMessage text={props.error} />
        </Row>
    ) : undefined;
    const takeRewards = props.contract.rewardContinuationAddress ? (
        <Row withPadding>
            <ThemedButton
                disabled={!props.userAddress}
                //@ts-ignore
                text={`Take Rewards Only`} onClick={()=>{props.onTakeRewards(history, props)}}/>
        </Row>
    ) : undefined;
    return (
        <Page>
            <LoaderContainer />
             <PageTopPart>
                <Row centered><ThemedText.H2 styles={{...styles.stakingInfoHeader}}>{`Staking`}</ThemedText.H2></Row>
                <div style={{...styles.divider}}></div>
            </PageTopPart>
            {
                <>
                  <Row withPadding centered>
                      <ThemedText.H4>{'Amount To Withdraw'}</ThemedText.H4>
                  </Row>
                  <Row withPadding>
                    <InputCurrency
                        currencies={[{ label: props.symbol, key: props.symbol }]}
                        amountStr={props.amount}
                        onAmountChanged={props.onAmountToUnstakeChanged}
                        curreny={props.symbol}
                        onCurrencyChanged={() => { }}
                        autoFocus={true}
                        formatter={formatter}
                        inputMode={'decimal'}
                    />
                  </Row>
                  <Gap size={'small'}/>
                  <Row withPadding centered>
                      <ThemedText.H4>{'Amount In Stake'}</ThemedText.H4>
                  </Row>
                  <Row withPadding>
                      <InputGroupAddon
                          value={`${formatter.format(props.stakedAmount,true)} ${props.symbol}`}
                          inputMode={'decimal'}
                          disabled={true}
                      />
                  </Row>
                  <Gap/>
                  {error}
                  <Row withPadding>
                        <ThemedButton
                            //@ts-ignore
                            text={`UnStake`} onClick={()=>{props.onUnstakeToken(history, props)}}/>
                  </Row>
                  {takeRewards}
              </>
            }        
        </Page>
    );
}

//@ts-ignore
const themedStyles = (theme) => ({
    divider: {
        height: '3px',
        borderTopStyle: "solid" as "solid",
        borderTopColor: 'rgba(249, 64, 43, 1)',
        width: '10%',
        margin: '0px auto',
    },
    stakingInfoHeader: { 
        justifyContent: 'center',  
        fontSize: '19px',
        fontWeight: 'bold',
        letterspacing: 1,
        lineHeight: '1.2'
    },
})

export const UnstakeTokenContainer = connect(
  UnstakeToken.mapStateToProps, UnstakeToken.mapDispatchToProps)(UnstakeTokenComponent);