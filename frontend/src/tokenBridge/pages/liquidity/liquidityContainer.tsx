import React, { useState,useEffect } from 'react';
import { connect } from 'react-redux';
import { liquidityProps,liquidityDisptach,Liquidity } from './liquidity';
import { Divider } from '@fluentui/react-northstar'
import { TextField} from 'office-ui-fabric-react';
import {
    Gap
    // @ts-ignore
} from 'desktop-components-library';
import { PrimaryButton } from 'office-ui-fabric-react';
import { useHistory } from 'react-router';
import { useToasts } from 'react-toast-notifications';
import { formatter, Utils } from '../../../common/Utils';
function LiquidityComponent(props: liquidityProps&liquidityDisptach) {
    const [action,setAction] = useState(true)
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
                <div className="main-header"> Ferrum Token Bridge </div>
                    <div className="body-not-centered swap">
                        <div className="header title">  
                            <div>
                                Manage Liquidity
                                <Divider/>
                            </div>
                            <div>
                                <div className="space-out">
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
                            </div>
                        </div>
                    </div>
                    <div className="pad-main-body">
                        <div className="space-out liquidity-tabs">
                            <span className={action ? 'emphasize' : undefined } onClick={()=>setAction(!action)}>Add Liquidity</span>
                            <div className="vert-divider"></div>
                            <span className={action ? undefined : 'emphasize' } onClick={()=>setAction(!action)}>Remove Liquidity</span>
                        </div>
                    </div>
                    {
                        action &&
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
                                    <Gap size={"small"}/>
                                    <div>
                                        <div className="header">Amount of Liquidity to Add</div>
                                        <div className="content">
                                            <div>
                                                <TextField
                                                    placeholder={'Amount'}
                                                    value={props.amount}
                                                    onChange={(e,v)=>props.amountChanged(v)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="content">{ !props.network ? 'Kindly Reconnect' : undefined}</div>
                                    <div className="content">{ !props.selectedToken ? 'Kindly Select a netwrok token' : undefined}</div>
                                    <Gap size={"small"}/>                                 
                            </div>
                    }
                    {
                        !action &&
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
                                    <Gap size={"small"}/>
                                    <div>
                                        <div className="header">Amount of Liquidity to Remove</div>
                                        <div className="content">
                                            <div>
                                                <TextField
                                                    placeholder={'Enter Amount'}
                                                    value={props.amount}
                                                    onChange={(e,v)=>props.amountChanged(v)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="content">{ !props.network ? 'Kindly Reconnect' : undefined}</div>
                                    <div className="content">{ !props.selectedToken ? 'Kindly Select a netwrok token' : undefined}</div>
                                    <Gap size={"small"}/>
                            </div>
                    }
                    <div className="liqu-details">
                        <div className="my-liqu-details">
                            <p className="value">
                                {formatter.format(props.availableLiquidity,false)}
                                <span>{props.symbol}</span>
                            </p>
                            
                            <p>
                                Your Liquidity Balance
                            </p>
                        </div>
                        

                        <PrimaryButton 
                            ariaDescription="Detailed description used for screen reader."
                            onClick={
                                () => action ? props.addLiquidity(props.amount,props.currency,onSuccessMessage)
                                : props.removeLiquidity(props.amount,props.currency,onSuccessMessage)
                            }
                            disabled={Number(props.amount) <= 0 || !props.currency || !props.network  ||  !props.selectedToken}
                        >
                            {action ? 'Add Liquidity' : 'Remove Liquidity'}
                        </PrimaryButton>
                    </div>   
            </>
        </div>
    )
}

export const LiquidityContainer = connect(
    Liquidity.mapStateToProps,
    Liquidity.mapDispatchToProps
)(LiquidityComponent);