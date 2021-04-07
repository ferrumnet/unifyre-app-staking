import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import { Swap,swapDisptach,swapProps } from './swap';
import { Divider } from '@fluentui/react-northstar'
import { TextField} from 'office-ui-fabric-react';

function SwapComponent(props:swapDisptach&swapProps){
    const histroy = useHistory()
    useEffect( () => {
        if(!props.network){
            histroy.push('/');
        }else{
            props.onConnect(props.network);
        }
    },[]);
    return (
        <div className="centered-body">
            <>
                <div className=" centered main-header"> Ferrum Token Bridge </div>
                <div className="body-not-centered swap">

                    <div className="header title">  
                        Swap Accross Chains
                        <Divider/>
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
                                <select name="cars" id="cars" className="content">
                                    <option value="volvo">FRM</option>
                                    <option value="saab">RINKEBY</option>
                                    <option value="mercedes">BSC</option>
                                </select>
                            </>
                        </div>
                        <div className="content">You will recieve your token on network in this smart contract address</div>
                    </div>

                    <div className="pad-main-body second">
                        <div>
                            <div className="header">Send Token to the below</div>
                            
                        </div>
                        <div>
                            <div className="space-out">
                                <span>Addresss</span>
                                <span className="bold">0x455</span>
                            </div>
                        </div>
                        <div>
                            <div className="space-out">
                                <span>Available Liquidity</span>
                                <span className="bold">500</span>
                            </div>
                        </div>

                        <div> 
                            <div className="space-out">
                                <span>Fee</span>
                                <span className="bold">500</span>
                            </div>
                        </div> 
                    </div>
                </div>
                <div className="bottom-stick">
                    <div>Note:  Liquidity is provided by liquidity provider. Only swap much less than the avaialable liquidity to ensure there is enough tokens to claim.</div>
                    <div> - Send tokens to the swap addresson ETHEREUM network</div>
                    <div> - Connect your BSC wallet</div>
                    <div> - Claim your balance on BSC network</div>
                </div>
            </>
        </div>
    )
}

export const SwapContainer =  connect(
    Swap.mapStateToProps,Swap.mapDispatchToProps
)(SwapComponent);