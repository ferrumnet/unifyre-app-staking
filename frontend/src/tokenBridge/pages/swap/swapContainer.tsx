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

function SwapComponent(props:swapDisptach&swapProps){
    const histroy = useHistory();
    const { addToast } = useToasts();

    useEffect( () => {
        if(!props.pairedAddress){
            histroy.push('/');
        }else{
            props.onConnect(props.network);
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
                <div className=" centered main-header"> Ferrum Token Bridge </div>
                <div className="body-not-centered swap">

                    <div className="header title">  
                        <div>
                            Swap Accross Chains
                            <Divider/>
                        </div>
                        <div>
                            Return
                            <Divider/>
                        </div>
                    </div>

                    <div className="pad-main-body">
                        <div>
                            <div className="header">Current Network</div>
                            <div className="content">
                                <div>
                                    <TextField
                                        placeholder={'Current Network'}
                                        value={props.network}
                                        disabled={true}
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="header">Select token you want to swap</div>
                            <>
                                <select name="token" id="token" className="content" disabled={props.addresses.length === 0} onChange={(e)=>props.tokenSelected(e.target.value,props.addresses)}>
                                    <option value={'select your Token symbol'}>select your Token symbol</option>
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
                        <div className="content">You will recieve your token on {props.network} network in this smart contract address</div>
                        <Gap size={"small"}/>
                        <div>
                            <div className="space-out swap-entry">
                                <TextField
                                    placeholder={'Amount to Swap'}
                                    value={props.amount}
                                    disabled={false}
                                    onChange={(e,v)=>props.amountChanged(v)}
                                    type={'Number'}
                                />
                                <PrimaryButton 
                                    ariaDescription="Detailed description used for screen reader."
                                    onClick={
                                        () => props.onSwap(props.amount,props.swapDetails.currency,props.currenciesDetails.targetCurrency,onMessage,onSuccessMessage)
                                    }
                                >
                                    SWAP
                                </PrimaryButton>
                            </div>
                        </div>
                        <div className="content">You currently have {props.balance} amount of {props.symbol}</div>
                    </div>

                    <div className="pad-main-body second">
                      
                        <div>
                            <div className="space-out">
                                <span>Available Liquidity in {props.network} </span>
                                <span className="bold">500</span>
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
                    <div>Note:  Liquidity is provided by liquidity provider. Only swap much less than the avaialable liquidity to ensure there is enough tokens to claim.</div>
                    <div> - Claim your balance from your withdrawal items</div>
                </div>
            </>
        </div>
    )
}

export const SwapContainer =  connect(
    Swap.mapStateToProps,Swap.mapDispatchToProps
)(SwapComponent);