import React, {useContext, useEffect} from 'react';
import failed from './images/failed.png';
import { Utils } from '../../common/Utils';
import loading from './images/loading.gif';
import { useHistory } from 'react-router-dom';
import { Row, Gap, ThemedText, ThemedLink, WebThemedButton as ThemedButton } from 'unifyre-web-components';
import { ThemeContext } from 'unifyre-react-helper';
import greenTick from '../../images/green-tick.png';

function FailedTransactionView({
    network,
    txIds,
}) {
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
                    <ThemedText.H3>{`Check your failure reason on transactions (etherscan). You can try again or contact our telegram group`}</ThemedText.H3>
                </Row>
                <Gap size={'small'}/>
                <Row withPadding centered>
                    <ThemedText.H4>{'TransactionId'}</ThemedText.H4>
                </Row>
                {txIds.map( (txId, i) => 
                    <Row key={i} withPadding centered>
                        <ThemedLink text={Utils.shorten(txId)}
                            onClick={() => window.open(Utils.linkForTransaction(network, txId))}
                        /> 
                    </Row> 
                    )}
            <Gap/>
        </>
    );
}

function PendingTransactionView({
    network,
    txIds,
    transactionStatus,
}) {
    return (
        <>
            <Gap/>
                <Row centered>
                    <ThemedText.H3>{'Transactions in progress'}</ThemedText.H3>
                </Row>
                <Gap/>
                {txIds.map((txId, i) =>
                    <React.Fragment key={i}>
                        <Row withPadding centered>
                                <ThemedText.H4>{'Transaction ID'}</ThemedText.H4>
                        </Row>
                        <Row withPadding centered>
                                <ThemedLink text={Utils.shorten(txId)}
                                    onClick={() => window.open(Utils.linkForTransaction(network, txId), '_blank')}
                                />  
                        </Row>
                    </React.Fragment>
                )}

                <Gap size={'small'}/>
                <Row withPadding centered>
                        <ThemedText.H4>{'TransactionStatus'}</ThemedText.H4>
                </Row>
                <Row withPadding centered>
                        <ThemedText.H4>{transactionStatus}</ThemedText.H4> 
                </Row>
                <Gap size={'small'}/>
                <Gap size={'small'}/>
                <Row withPadding centered>
                        <ThemedText.SMALL>{'Please wait until transactions are confirmed'}</ThemedText.SMALL>
                </Row>
                <Row centered>
                <img style={{"width":'150px','position':'absolute','borderRadius':'50%'}} src={loading}/>
                </Row>
            <Gap size={'small'}/>
        </>
    );
}

function SuccessfulTransactionView({
    network,
    txIds,
    successMessage,
    okButtonText,
    okButtonUrl,
}) {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    const history = useHistory();
    
    return (
        <>
            <Gap/>
            <Row withPadding centered>
                    <ThemedText.H2>{`Congratulations`}</ThemedText.H2>
            </Row>
            <Gap size={'small'}/>
            <Row withPadding centered>
                <img style={{"width":'70px'}} src={greenTick}/>
            </Row>
            <Row withPadding centered>
                <ThemedText.H3>{successMessage}</ThemedText.H3>
            </Row>
            {
                ((txIds.length && network === "ARBITRUM_ETHEREUM") ? [txIds[txIds?.length - 1]] : txIds).map((txId, i) => 
                    <React.Fragment key={i}>
                        <Gap size={'small'}/>
                        <Row withPadding centered>
                            <ThemedText.H4>{'TransactionId'}</ThemedText.H4>
                        </Row>
                        <Row withPadding centered>
                            <ThemedLink text={Utils.shorten(txId)}
                                onClick={() => window.open(Utils.linkForTransaction(network, txId))}
                            /> 
                        </Row> 
                    </React.Fragment>
                )
            }
            <Gap/>
            <Row withPadding>
                <ThemedButton
                    highlight={true}
                    text={okButtonText}
                    onClick={() => history.replace(okButtonUrl)}
                    textStyle={styles.btnText}/>
            </Row>
        </>
    );
}

export function TransactionContinuation({
        network, requestId, onLoad, txIds, okButtonText, okButtonUrl, backButtonUrl,
        onRefresh, transactionStatus, error, successMessage,
    }) {
    const history = useHistory();
    useEffect(() => {
        console.log('heloooooooo',requestId)
        if (requestId) {
            onLoad(requestId);
        }
    }, [onLoad, requestId]);
    
    useEffect(() => {
        if (transactionStatus === 'pending'){
            const interval = setInterval(() => {
                console.log('callinginngngngn')
                onRefresh().catch(console.error);
              }, 15000);
            return () => clearInterval(interval);
        }
      }, [transactionStatus, onRefresh]);

    const fatalError = error && (
        <>
         <Gap size={'small'}/>
          <Row withPadding centered>
            <ThemedText.H4>{error}</ThemedText.H4>
          </Row>
          <Gap size={'small'}/>
        </>
    )

    let mainPart = (<> </>);
    switch (transactionStatus) {
        case 'pending':
            mainPart = (<PendingTransactionView {...{network, txIds, transactionStatus}} />);
            break;
        case 'successful':
            mainPart = (<SuccessfulTransactionView {...{network, txIds, successMessage, okButtonUrl, okButtonText}}/>);
            break;
        case 'failed':
            mainPart = (<FailedTransactionView {...{network, txIds}}/>);
            break;
    }

    return (
        <>
            {fatalError}
            {mainPart}
            <Row withPadding centered>
                <ThemedLink text={'Go back'}
                    onClick={() => history.replace(backButtonUrl)}
                />  
            </Row>
        </>
    );
}

// TODO: Utilize the theme??
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
        textAlign: "center",
        marginTop: '15px',
        marginRight: '0px',
        marginLeft: '40px',
        marginBottom: '2px',
        width:'40%',
        display: 'flex',
        flexDirection: "row",
    },
    arrows: {
        marginRight: '10px',
        marginLeft: '10px',
        width: '16px'
    },
    divider: {
        height: '3px',
        borderTopStyle: "solid",
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

