import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import { Swap,swapDisptach,swapProps } from './swap';
import { Divider } from '@fluentui/react-northstar'
import { TextField} from 'office-ui-fabric-react';
import { PrimaryButton } from 'office-ui-fabric-react';
import {
    Gap
    // @ts-ignore
} from 'desktop-components-library';
import { useToasts } from 'react-toast-notifications';
import { formatter, Utils } from '../../../common/Utils';

function SwapComponent(props:swapDisptach&swapProps){
    const histroy = useHistory();
    const { addToast } = useToasts();

    useEffect( () => {
        if(!props.pairedAddress){
            histroy.push('/');
        }else{
            props.onConnect(props.network,props.network,props.currency);
        }
    },[]);

    const onMessage = async (v:string) => {    
        addToast(v, { appearance: 'error',autoDismiss: true })        
    };

    const onSuccessMessage = async (v:string) => {    
        addToast(v, { appearance: 'success',autoDismiss: true })        
    };
    

    return (
        <div className="centered-body">
            <>
                <div className="main-header"> Ferrum Token Bridge </div>
                <div className="body-not-centered swap">

                    <div className="header title">  
                        <div>
                            Swap Accross Chains
                            <Divider/>
                        </div>
                    </div>

                    <div className="pad-main-body">
                        <Gap/>
                        <Gap/>
                        <div className="space-out sel">
                            <div className="header">{props.network} Network to {props.destNetwork === props.network ? props.baseNetwork : props.destNetwork} </div>
                            <>
                                <select name="token" id="token" className="content token-select" disabled={props.addresses.length === 0} onChange={(e)=>props.tokenSelected(e.target.value,props.addresses)}>
                                    <option value={'select your Token symbol'}>Select Token</option>
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
                            :  <div className="content">You currently have {formatter.format(props.balance,true)} amount of {props.symbol} available for swap.</div>

                        }
                        <div>
                            <div className="space-out swap-entry">
                                <PrimaryButton 
                                    ariaDescription="Detailed description used for screen reader."
                                    onClick={
                                        () => props.onSwap(props.amount,props.balance,props.swapDetails.currency,props.currenciesDetails.targetCurrency,onMessage,onSuccessMessage)
                                    }
                                    disabled={!props.selectedToken}
                                >
                                    SWAP
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                    <Gap size="small"/>
                    <div className="pad-main-body second">
                        <div>
                            <div className="space-out">
                                <span>Available {props.selectedToken} Liquidity in {props.network} </span>
                                <span className="bold">{formatter.format(props.availableLiquidity,true)}</span>
                            </div>
                        </div>

                        <div> 
                            <div className="space-out">
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

export const SwapContainer =  connect(
    Swap.mapStateToProps,Swap.mapDispatchToProps
)(SwapComponent);