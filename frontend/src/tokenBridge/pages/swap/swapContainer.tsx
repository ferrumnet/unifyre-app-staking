import React, { useEffect,useContext } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import { Swap,swapDisptach,swapProps } from './swap';
import { Divider } from '@fluentui/react-northstar'
import { TextField} from 'office-ui-fabric-react';
import { PrimaryButton } from 'office-ui-fabric-react';
import {
    Gap,WebThemedButton
    // @ts-ignore
} from 'desktop-components-library';
import { useToasts } from 'react-toast-notifications';
import { formatter, Utils } from '../../../common/Utils';
import {ThemeContext, Theme} from 'unifyre-react-helper';

function SwapComponent(props:swapDisptach&swapProps){
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);   
    const histroy = useHistory();
    const { addToast } = useToasts();

    useEffect( () => {
        if(!props.pairedAddress?.pair){
            histroy.push('/');
        }else{
            props.onConnect(props.network,props.pairedAddress.pair.network1,props.currency);
        }
    },[]);

    useEffect(() => {
        const interval = setInterval(async () => {
            await props.updatePendingWithrawItems();
        }, 
        30000 );
        return () => clearInterval(interval);
    }, [])

    const onMessage = async (v:string) => {    
        addToast(v, { appearance: 'error',autoDismiss: true })        
    };

    const onSuccessMessage = async (v:string) => {    
        addToast(v, { appearance: 'success',autoDismiss: true })        
    };
    let pendingItems = props.userWithdrawalItems.filter(e=>e.used === 'pending').length;
    return (
        <div className="centered-body">
            <>
                <div className="body-not-centered swap swap-page">
                    <div className="header title ">  
                        <div style={styles.headerStyles}>
                            Swap Accross Chains
                            <Divider/>
                        </div>
                    </div>
                    {
                        pendingItems > 0 ? <div className="content notif centered itemlist">You have {pendingItems} Item(s) ready for withdrawal</div>
                        : <>
                            <Gap/>
                        </>
                    }
                    <div className="pad-main-body">
                        <div className="space-out sel" >
                            <div className="header" style={styles.headerStyles}>{props.network} Network to {props.destNetwork === props.network ? props.baseNetwork : props.destNetwork} </div>
                            <>
                                <select name="token" id="token" 
                                    className="content token-select" disabled={props.addresses.length === 0} 
                                    style={styles.headerStyles}
                                    onChange={(e)=>props.tokenSelected(props.currenciesDetails.targetCurrency,e.target.value,props.addresses,props.pairedAddress.pair,histroy)}
                                    value={props.selectedToken}
                                >
                                    <option value={''}>Select Token</option>
                                    {
                                        props.addresses.length > 0 ?
                                            props.addresses.map(e=>
                                                <option value={e.symbol}>{e.symbol}</option>
                                            )
                                        : <option value={'Not Available'}>Not Available</option>
                                    }
                                </select>
                            </>
                        </div>
                        <div className="swap-main">
                            <div className="swap-from">
                                   <div className="sub-tit">FROM {props.symbol} {props.network}</div>
                                   <TextField
                                        placeholder={'0.0'}
                                        value={props.amount}
                                        disabled={false}
                                        onChange={(e,v)=>props.amountChanged(v)}
                                        type={'Number'}
                                    />
                            </div>

                            <div className="icon">
                                <div className="arrow"></div>
                            </div>

                            <div className="swap-from">
                                <div className="sub-tit">TO {props.symbol} {props.destNetwork === props.network ? props.baseNetwork : props.destNetwork}</div>
                                <TextField
                                    placeholder={'0.0'}
                                    value={(Number(props.amount) - (Number(props.currenciesDetails.fee)|| 0)).toString()}
                                    disabled={true}
                                    onChange={(e,v)=>props.amountChanged(v)}
                                    type={'Number'}
                                />
                            </div>
                        </div>
                        {
                            !props.selectedToken ? <div className="content notif">Select a Token to swap from the options above</div>
                            :  <div className="content" style={styles.headerStyles}>You currently have {formatter.format(props.balance,true)} amount of {props.symbol} available for swap.</div>

                        }
                        <div>
                            <div className="space-out swap-entry swap-buttons">
                                <WebThemedButton
                                    text={'SWAP'}
                                    onClick={
                                        () => props.onSwap(props.amount,props.balance,props.swapDetails.currency,props.currenciesDetails.targetCurrency,onMessage,onSuccessMessage,props.allowanceRequired)
                                    }
                                    disabled={!props.selectedToken || (Number(props.amount) <= 0) || props.allowanceRequired}
                                />
                                <WebThemedButton
                                    text={'APPROVE'}
                                    onClick={
                                        () => props.onSwap(props.amount,props.balance,props.swapDetails.currency,props.currenciesDetails.targetCurrency,onMessage,onSuccessMessage,props.allowanceRequired)
                                    }
                                    disabled={!props.selectedToken || (Number(props.amount) <= 0) || !props.allowanceRequired}
                                />
                            </div>
                        </div>
                        <Gap size="small"/>
                    </div>
                    <div className="pad-main-body second">
                        <div>
                            <div className="space-out" style={styles.headerStyles}>
                                <span>Available {props.selectedToken} Liquidity in {props.network} </span>
                                <span className="bold">{formatter.format(props.availableLiquidity,true)}</span>
                            </div>
                        </div>

                        <div> 
                            <div className="space-out" style={styles.headerStyles}>
                                <span>Fee</span>
                                <span className="bold">{props.currenciesDetails.fee || 0}</span>
                            </div>
                        </div> 
                    </div>
                </div>
                <div className="bottom-stick">
                    <div>Note:  Claim your balance from your withdrawal items</div>
                </div>
            </>
        </div>
    )
}

//@ts-ignore
const themedStyles = (theme) => ({
    btnStyle:  {
        root: [
          {
            padding: "1.3rem 2.5rem",
            backgroundColor: theme.get(Theme.Button.btnPrimary),
            borderColor: theme.get(Theme.Button.btnPrimary) || '#ceaa69',
            color: theme.get(Theme.Button.btnPrimaryTextColor),
            height: '40px',
          }
        ]
    },
    headerStyles: {
        color: theme.get(Theme.Colors.textColor),
    }
});

export const SwapContainer =  connect(
    Swap.mapStateToProps,Swap.mapDispatchToProps
)(SwapComponent);