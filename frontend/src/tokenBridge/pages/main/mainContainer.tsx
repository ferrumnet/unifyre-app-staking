import React, {useEffect} from 'react';
import { connect } from 'react-redux';
import { Main,MainDispatch, MainProps } from './main';
import { ConnectButton } from './../../../base/ConnectButton';
import {
    WebThemedButton,Gap,Row
    // @ts-ignore
} from 'desktop-components-library';
import { TextField} from 'office-ui-fabric-react';
import { ConButton } from '../../../base/NavBar';
import { ConnectorContainer } from '../../../connect/ConnectContainer';
import { RootState } from '../../../common/RootState';
import { IocModule } from '../../../common/IocModule';
import { Divider } from '@fluentui/react-northstar'
import greenTick from './../../../images/green-tick.png'
import { useHistory } from 'react-router';
import { CHAIN_ID_FOR_NETWORK } from '../../TokenBridgeTypes';

function ConnectedWallet(props: MainProps&MainDispatch&{con:()=>void,onErr:(v:string)=>void}) {
        const history = useHistory();
        return (
            <div>
                <>
                    <div className=" centered main-header"> Ferrum Token Bridge </div>
                    <div className="body-not-centered">
                        <div className="header title">  
                            Your Paired Addresses
                            <Divider/>
                        </div>
                        <div className="pad-main-body">
                            <div className="header">First Network</div>
                            <div className="content">
                                <div>
                                    <TextField
                                        placeholder={'Enter Network'}
                                        value={props.pairedAddress?.network1}
                                        disabled={true}
                                    />
                                </div>
                            </div>
                            <div className="header">Address</div>
                            <div className="content">
                                <div>
                                    <TextField
                                        placeholder={'Enter Address'}
                                        value={props.pairedAddress?.address1}
                                        disabled={true}
                                    />
                                </div>
                            </div>
                            {
                                (props.isPaired && !props.baseSignature) &&
                                <div>
                                    <WebThemedButton
                                        text={'Sign to Prove OwnerShip'}
                                        onClick={()=>props.signFirstPairAddress(props.destNetwork,props.pairedAddress?.address2)}
                                    /> 
                                </div>
                            }
                            {
                                (props.baseSigned || props.baseSignature) && 
                                    <div>
                                        <div className="successful-cont">
                                            <img style={{"width":'30px'}} src={greenTick}/>
                                            <div className="header"> Signed Successfully</div>
                                        </div>
                                    </div>
                            }
                            
                        </div>
                        
                        
                        <div className="pad-main-body">
                            {
                                !props.destConnected &&
                                <>
                                    <div className="header">Second Network</div>
                                    {
                                        props.destConnected ?
                                            props.destNetwork
                                            :   <div className="content">
                                                    <select name="networks" id="networks" onChange={(v)=>props.onDestinationNetworkChanged(v.target.value)}  disabled={props.isPaired ? true : false}>
                                                        {Object.keys(CHAIN_ID_FOR_NETWORK).map(n => (
                                                            <option key={n} value={n}>{n}</option> 
                                                        ))}
                                                    </select>
                                                </div>
                                    }
                                    <div className="header">Address</div>
                                    {
                                        props.destConnected ?
                                            props.destNetwork :
                                            <div className="content">
                                                <TextField
                                                    placeholder={'Enter Your Second Network Address'}
                                                    onChange={(e,v)=>props.onAddressChanged(v||'')}
                                                    defaultValue={props.destAddress}
                                                    disabled={props.isPaired ? true : false}
                                                />
                                            </div>
                                    }
                                    {
                                        !props.isPaired &&
                                        (!props.destSigned && props.destAddress) && 
                                            <div className="centered">
                                                <Gap size={"small"}/>
                                                <WebThemedButton
                                                    text={'Pair Addresses'}
                                                    onClick={()=>props.pairAddresses(props.destAddress,props.destNetwork)}
                                                    disbabled={!!props.destAddress}
                                                />  
                                            </div>
                                    }
                                    {
                                        (!props.destSignature) ?
                                            (props.isPaired) &&
                                            <>
                                                {
                                                    (props.connected) ? 
                                                        (props.destNetwork != props.baseNetwork) ?
                                                            <div className="header centered">Connect your MetaMask to {props.destNetwork} in order to Sign this Address.</div>
                                                        :   <WebThemedButton
                                                                text={'Sign to Prove OwnerShip'}
                                                                onClick={()=>props.signSecondPairAddress(
                                                                    props.pairedAddress?.network1||'' , props.destNetwork,props.destAddress, props.baseSignature
                                                                )}
                                                                disbabled={!!props.destAddress}
                                                            /> 
                                                    :   <WebThemedButton
                                                            text={'Connect to Network'}
                                                            onClick={()=>props.onReconnect()}
                                                            disbabled={!!props.destAddress}
                                                        /> 
                                                    
                                                } 
                                            </>
                                        :   <div>
                                                <div className="successful-cont">
                                                    <img style={{"width":'30px'}} src={greenTick}/>
                                                    <div className="header"> Signed Successfully</div>
                                                </div>
                                            </div>
                                    }
                                    {
                                        <div className="pad-main-body verify">
                                            {
                                                (props.isPaired) &&
                                                    <WebThemedButton
                                                        text={'UnPair and Reset'}
                                                        //@ts-ignore
                                                        onClick={props.signedPairedAddress?.signature1 ? () => props.unPairAddresses(props.signedPairedAddress) : ()=>props.resetPair()}
                                                    />
                                            }
                                            {
                                                (props.destSignature && props.baseSignature) &&
                                                    <WebThemedButton
                                                        text={'Swap Token'}
                                                        onClick={()=>props.startSwap(history)}
                                                    />
                                            }                        
                                        </div>
                                    }
                                </>
                            }
                        </div>                        
                    </div>
                </>
            </div>
        )
}

function MainComponent(props: MainProps&MainDispatch&{con:()=>void,onErr:(v:string)=>void}) {
    
    const ConBot = ConnectorContainer.Connect(IocModule.container(), ConButton);
  
    return (
        <div className="centered-body">
            {
                (!props.initialised) &&
                <>
                    <div className="main-header"> Ferrum Token Bridge </div>
                    <div className="body-content">
                        <div>
                            <div> Connect Your Wallet To See Your Paired Addresses. </div>
                            <Gap/>
                            <div>  
                                <ConBot 
                                    onConnect={props.onConnected}
                                    onConnectionFailed={props.onConnectionFailed}
                                    onConnected={props.con}
                                    dataSelector={(state: RootState) => state.data.userData}
                                    // appInitialized={props.initialized}
                                    appInitialized={true}
                                />
                            </div>
                        </div>
                    </div>
                </>

            }
            {
                (props.initialised) && <ConnectedWallet {...props} />
            }
          
        </div>
    )
}

export const MainContainer = connect(
    Main.mapStateToProps,
    Main.mapDispatchToProps
)(MainComponent);