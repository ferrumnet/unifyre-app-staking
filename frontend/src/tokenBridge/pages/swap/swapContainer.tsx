import React, { useEffect,useContext,useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import { Swap,swapDisptach,swapProps } from './swap';
import { Divider } from '@fluentui/react-northstar'
import { TextField} from 'office-ui-fabric-react';
import { useId, useBoolean } from '@fluentui/react-hooks';
import {
    Gap,WebThemedButton
    // @ts-ignore
} from 'desktop-components-library';
import { useToasts } from 'react-toast-notifications';
import { formatter } from '../../../common/Utils';
import {ThemeContext, Theme} from 'unifyre-react-helper';
import {SwapModal} from './../../../components/swapModal';
import { ReloadOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';

function SwapComponent(props: swapDisptach&swapProps&{con:()=>void}){
    const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
    const [refreshing,setRefreshing] = useState(false);
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

    const handleRefresh = async () => {
        setRefreshing(true);
        await props.tokenSelected(props.currenciesDetails.targetCurrency,props.selectedToken,props.addresses,props.pairedAddress.pair,histroy);
        setRefreshing(false);
    }

    const onSuccessMessage = async (v:string) => {    
        addToast(v, { appearance: 'success',autoDismiss: true })        
    };
    let unUsedItems = props.userWithdrawalItems.filter(e=>e.used === '').length;
    let unUsedTotal = props.userWithdrawalItems.filter(e=>e.used === '').reduce((a, b) => Number(a.receiveAmount||a) + Number(b.receiveAmount), 0);
    
    console.log(props,'props8989');
    
    return (
        <div className="centered-body">
            <SwapModal
                isModalOpen={isModalOpen}
                showModal={showModal}
                hideModal={hideModal}
                status={1}
                txId={props.swapId}
                sendNetwork={props.network}
                timestamp={Date.now()}
                callback={props.checkTxStatus}
                itemCallback={props.checkifItemIsCreated}
                itemId={props.itemId}
                claim={props.con}
            />
            <>
                <div className="body-not-centered swap swap-page">
                    <div className="header title ">  
                        <div style={styles.headerStyles}>
                            Swap Accross Chains
                            <Divider/>
                        </div>
                        <div>
                            <div className="space-out">
                                { props.selectedToken && <div style={{...styles.textStyles}} onClick={()=>handleRefresh()}> Refresh Balance Data <ReloadOutlined style={{color: `${theme.get(Theme.Colors.textColor)}`,width: '20px'}} spin={refreshing}/> </div> }
                            </div>
                        </div>
                    </div>
                    {
                        unUsedItems > 0 ? <div className="content notif centered itemlist" style={styles.headerStyles}>You have {unUsedItems} Item(s) with {unUsedTotal} tokens ready for <span  style={styles.pointerStyle} onClick={props.con}>Withdrawal.</span></div>
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
                                    onChange={(e)=>props.tokenSelected(props.currenciesDetails.targetCurrency,e.target.value,props.addresses,props.pairedAddress.pair,histroy)}
                                    value={props.selectedToken}
                                    style={{...styles.textStyles,...styles.optionColor}}
                                >
                                    {!props.selectedToken && <option style={{...styles.textStyles,...styles.optionColor}} value={''}>Select Token</option>}
                                    {
                                        props.addresses.length > 0 ?
                                            props.addresses.map(e=>
                                                <option style={{...styles.textStyles,...styles.optionColor}} value={e.symbol}>{e.symbol}</option>
                                            )
                                        : <option style={{...styles.textStyles,...styles.optionColor}} value={'Not Available'}>Not Available</option>
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
                                        () => props.onSwap(props.amount,props.balance,props.swapDetails.currency,props.currenciesDetails.targetCurrency,onMessage,onSuccessMessage,props.allowanceRequired,showModal)
                                    }
                                    disabled={!props.selectedToken || (Number(props.amount) <= 0) || props.allowanceRequired}
                                />
                                {
                                    props.allowanceRequired &&
                                        <WebThemedButton
                                            text={'APPROVE'}
                                            onClick={
                                                () => props.onSwap(props.amount,props.balance,props.swapDetails.currency,props.currenciesDetails.targetCurrency,onMessage,onSuccessMessage,props.allowanceRequired,showModal)
                                            }
                                            disabled={!props.selectedToken || (Number(props.amount) <= 0) || !props.allowanceRequired}
                                        />
                                }
                                
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
    },
    textStyles: {
        color: theme.get(Theme.Colors.textColor),
    },
    optionColor: {
        backgroundColor: theme.get(Theme.Colors.bkgShade0)
    },
    pointerStyle: {
        cursor: "pointer",
        color:  theme.get(Theme.Button.btnPrimary) || '#ceaa69',
    }
});

export const SwapContainer =  connect(
    Swap.mapStateToProps,Swap.mapDispatchToProps
)(SwapComponent);