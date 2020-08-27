import React, {useContext, useEffect} from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
    Page,PageTopPart,  Row, ThemedText, Gap, ThemedButton, ErrorMessage,
    ThemedLink
    // @ts-ignore
} from 'unifyre-web-components';
import logo from '../../images/loading.gif';
import {  Utils } from "../../common/Utils";
import { ConfirmTxn, confirmationDispatch, confirmationProps } from './ConfirmTxn';
import {ThemeContext} from 'unifyre-react-helper';
import { LoaderContainer } from '../../components/Loader';
import check from '../../images/right.png';
import failed from '../../images/failed.png';
import { intl } from "unifyre-react-helper";

function PendingTransactionView(props: confirmationProps&confirmationDispatch) {
    return (
        <>
            <Gap/>
                <Row centered>
                    <ThemedText.H3>{'STAKING TRANSACTION PROCESSING'}</ThemedText.H3>
                </Row>
                <Gap/>
                <Row withPadding centered>
                        <ThemedText.H4>{'Pending TransactionId'}</ThemedText.H4>
                </Row>
                <Row withPadding centered>
                        <ThemedLink text={Utils.shorten(props.stakeEvent.mainTxId)}
                            onClick={() => window.open(Utils.linkForTransaction(props.network, props.transactionId!))}
                        />  
                </Row>
                <Gap size={'small'}/>
                <Row withPadding centered>
                        <ThemedText.H4>{'TransactionStatus'}</ThemedText.H4>
                </Row>
                <Row withPadding centered>
                        <ThemedText.H4>{props.stakeEvent.transactionStatus}</ThemedText.H4> 
                </Row>
                <Gap size={'small'}/>
                <Gap size={'small'}/>
                <Row withPadding centered>
                        <ThemedText.SMALL>{'Please wait a minute'}</ThemedText.SMALL>
                </Row>
                <Row centered>
                <img style={{"width":'150px','position':'absolute','borderRadius':'50%'}} src={logo}/>
                </Row>
            <Gap size={'small'}/>
        </>
    );
}

function SuccessfulTransactionView(props: confirmationProps&confirmationDispatch) {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    
    return (
        <>
            <Gap/>
            <Row withPadding centered>
                    <ThemedText.H2>{`Congratulations`}</ThemedText.H2>
            </Row>
            <Gap size={'small'}/>
            <Row withPadding centered>
                <img style={{"width":'70px'}} src={check}/>
            </Row>
            <Row withPadding centered>
                <ThemedText.H3>{`You Successfully Staked ${props.stakeEvent.amountStaked} ${props.stakeEvent.symbol}`}</ThemedText.H3>
            </Row>
                <Gap size={'small'}/>
                <Row withPadding centered>
                    <ThemedText.H4>{'TransactionId'}</ThemedText.H4>
                </Row>
                <Row withPadding centered>
                    <ThemedLink text={Utils.shorten(props.stakeEvent.mainTxId)}
                        onClick={() => window.open(Utils.linkForTransaction(props.network, props.transactionId!))}
                    /> 
                </Row> 
            <Gap/>
            <Row withPadding>
                <ThemedButton
                    highlight={true}
                    text={`Stake More`}
                    onClick={()=>{
                        props.refreshStaking(props)}}
                    textStyle={styles.btnText}/>
            </Row>
        </>
    );
}

function FailedTransactionView(props: confirmationProps&confirmationDispatch) {    
    return (
        <>
            <Gap/>
                <Row withPadding centered>
                        <ThemedText.H3>{`Sorry, Staking failed`}</ThemedText.H3>
                </Row>
                <Row centered>
                    <img style={{"width":'170px'}} src={failed}/>
                </Row>
                <Row centered>
                    <ThemedText.H3>{`Kindly try again later`}</ThemedText.H3>
                </Row>
                <Gap size={'small'}/>
                <Row withPadding centered>
                    <ThemedText.H4>{'TransactionId'}</ThemedText.H4>
                </Row>
                <Row withPadding centered>
                    <ThemedLink text={Utils.shorten(props.stakeEvent.mainTxId)}
                        onClick={() => window.open(Utils.linkForTransaction(props.network, props.transactionId!))}
                    /> 
                </Row> 
            <Gap/>
        </>
    );
}

function ConfirmationComponent(props: confirmationProps&confirmationDispatch) {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    const history = useHistory();
    
    useEffect(() => {
        if(props.stakeEvent && props.stakeEvent?.transactionStatus === 'pending'){
            const interval = setInterval(async () => {
                await props.refreshStaking(props)
              }, 15000);
              return () => clearInterval(interval);
        }
      }, []);

    let transaction = props.stakeEvent;

    const fatalError = !props.stakeEvent?.mainTxId && (
        <>
         <Gap size={'small'}/>
          <Row withPadding centered>
            <ThemedText.H3 >{'Error Occured'}</ThemedText.H3>
          </Row>
          <Gap size={'small'}/>
          <Row withPadding centered>
            <ThemedText.H4>{`Your selected transaction doesn't seem to exist`}</ThemedText.H4>
          </Row>
          <Gap size={'small'}/>
        </>
    )

    let mainPart = (<> </>);
    switch (transaction.transactionStatus) {
        case 'pending':
            mainPart = (<PendingTransactionView {...props}/>);
            break;
        case 'successful':
            mainPart = (<SuccessfulTransactionView {...props}/>);
            break;
        case 'failed':
            mainPart = (<FailedTransactionView {...props}/>);
            break;
    }

    return (
        <Page>
            <LoaderContainer />
            <PageTopPart>
                <Row centered><ThemedText.H2 styles={{...styles.stakingInfoHeader}}>{`Staking`}</ThemedText.H2></Row>
                <div style={{...styles.divider}}></div>
            </PageTopPart>
            {fatalError}
            {mainPart}
            <Row withPadding centered>
                <ThemedLink text={'Go back'} onClick={() => history.replace(!props.stakeEvent ? `/` : `/info/${props.stakeEvent.contractAddress}`)} />  
            </Row>
        </Page>
    );
}

export const ConfirmTxnContainer = connect(
    ConfirmTxn.mapStateToProps, ConfirmTxn.mapDispatchToProps)(ConfirmationComponent);

  //@ts-ignore
const themedStyles = (theme) => ({
    stakingInfoHeader: { 
        justifyContent: 'center',  
        fontSize: '19px',
        fontWeight: 'bold',
        letterspacing: 1,
        lineHeight: '1.2'
    },
    stakingAmountStyle: {
        fontSize: '33px',
        lineHeight: 1,
        fontWeight: 900,
        letterSpacing: '2.4px',
        color:'rgb(255 59 47 / 88%)'
    },
    stakingSymbol:{
        paddingTop: '3px',
        letterSpacing: 1
    },
    unifyreMainTextlineHeight: {
        lineHeight: 0.9
    },
    smallerMediumText:{
        fontSize: '13px',
        letterSpacing: '1px',
        lineHeight: '0.8'
    },
    navHeader: {
        fontSize: '17px',
        lineHeight: 1
    },
    mediumText: {
        fontSize: '25px',
        fontWeight: 'bold',
        letterSpacing: '1px',
        lineHeight: '1.2'
    },
    littleText: {
        fontSize: '12.5px',
        fontWeight: 'bold'
    },
    percentStake: {
        textAlign: "center" as "center",
        marginTop: '15px',
        marginRight: '0px',
        marginLeft: '40px',
        marginBottom: '2px',
        width:'40%',
        display: 'flex',
        flexDirection: "row" as "row",
    },
    arrows: {
        marginRight: '10px',
        marginLeft: '10px',
        width: '16px'
    },
    divider: {
        height: '3px',
        borderTopStyle: "solid" as "solid",
        borderTopColor: 'rgba(249, 64, 43, 1)',
        width: '10%',
        margin: '0px auto',
    },
    highlight:{
        color: 'rgb(255, 59, 47)'
    },
    DurText: {
        fontSize: '12.5px' 
    },
    btnText: {
        color: '#ffffff',
        lineHeight:1.6,
        fontSize: '15px',
        fontWeight: 'bold',
        letterSpacing: '1px',
    },
    pendingHeader: {
        color: 'white',
        fontSize: '15px'
    }
});
