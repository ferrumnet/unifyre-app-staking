import React,{useEffect,useContext} from 'react';
import {ThemeContext} from 'unifyre-react-helper';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { UnifyreExtensionKitClient } from 'unifyre-extension-sdk';
import { addAction, CommonActions } from '../common/Actions';
import { inject } from '../common/IocModule';
import { RootState, Web3ConnectionState } from '../common/RootState';
// @ts-ignore
import { StakingAppClient } from '../services/StakingAppClient';
import { useAlert } from 'react-alert';
import { StakingAppServiceActions } from "./../services/StakingAppClient";
import {
    WebThemedButton
    // @ts-ignore
} from 'desktop-components-library';
import { StakingApp,StakeEvent } from "../common/Types";
import {Transactions} from '../components/transactions';
import { Utils } from '../common/Utils';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { useId, useBoolean } from '@uifabric/react-hooks';
import {ConnectModal} from './Modal';
import {WalletConnectControls} from './web3Controls';

const Actions = {
}

export interface NavBarProps extends Web3ConnectionState {
    symbol: string;
    userAddress: string;
    stakings: StakingApp[];
    currency: string,
    stakeEvents: StakeEvent[];
    groupId?: string;
    homepage: string;
    connected:  boolean;
}

interface NavBarDispatch {
    onConnect: () => void;
    clearError: () => void;
    wcConnect: () => void;
    onDisconnect: () => void;
}

export function mapStateToProps(state: RootState): NavBarProps {
    const userProfile = state.data.userData?.profile;
    const addr = userProfile?.accountGroups[0]?.addresses || {};
    const address = addr[0] || {};
    return {
        ...state.data.connection,
        symbol: address.symbol,
        userAddress: address.address,
        stakings: state.data.stakingData.contracts,
        currency: address.currency,
        stakeEvents: state.data.stakingData.stakeEvents,
        groupId: state.data.groupData.info.groupId,
        homepage: state.data.groupData.info.homepage,
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onConnect: async () => {
        const client = inject<UnifyreExtensionKitClient>(UnifyreExtensionKitClient);
        try {
            await client.signInWithToken('');
            dispatch(addAction(CommonActions.CONNECTION_SUCCEEDED, {}));
            const sc = inject<StakingAppClient>(StakingAppClient);
            await sc.signInToServer(dispatch);
        } catch(e) {
            dispatch(addAction(CommonActions.CONNECTION_FAILED, { message: `Connection failed ${e.message}` }))
        }
    },
    clearError: () => {
        dispatch(addAction(CommonActions.CLEAR_ERROR, {}))
    },
    wcConnect: async () =>{
        const client = inject<UnifyreExtensionKitClient>(UnifyreExtensionKitClient);
        try {
            await client.signInWithToken('');
            dispatch(addAction(CommonActions.CONNECTION_SUCCEEDED, {}));
            let walletConn = new WalletConnectControls
            await walletConn.enableWallet(dispatch);
            dispatch(addAction(CommonActions.CONNECTION_SUCCEEDED, {}));
            const sc = inject<StakingAppClient>(StakingAppClient);
            await sc.signInToServer(dispatch);
        }catch(e) {
            dispatch(addAction(CommonActions.CONNECTION_FAILED, { message: `Connection failed ${e.message}` }))
        }
    },
    onDisconnect: async () => {
        dispatch(addAction(CommonActions.DISCONNECT, {}))
    }
} as NavBarDispatch);

export function connectButtonReduce(state: Web3ConnectionState = { connected: false,error: '' }, action: AnyAction) {
    switch(action.type) {
        case CommonActions.CONNECTION_SUCCEEDED:
            return { connected: true, error: undefined };
        case CommonActions.CONNECTION_FAILED:
            return { connected: false, error: action.payload.message };
        case CommonActions.DISCONNECT: 
            return {connected: false}
        case CommonActions.CLEAR_ERROR:
            return {connected: false, error: ''}
        case StakingAppServiceActions.AUTHENTICATION_FAILED:
            return {connected: false, error: action.payload.message.split('(')[0]}
        case StakingAppServiceActions.GET_STAKING_CONTRACT_FAILED:
            return {error: action.payload.message.split('(')[0]}
        default:
            return state;
    }
}

function ConnectButton(props: NavBarProps&NavBarDispatch) {
    const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
    const theme = useContext(ThemeContext);   
    const styles = themedStyles(theme);
    const alert = useAlert();

    useEffect(() => {
        // if(props.error!='' && props.error!=null){
        //     alert.error(props.error)
        //     props.clearError()
        // }
    }, [props.error]);

    
    
    return (
        <>
             <WebThemedButton
                text={props.connected ? 'Connected' : 'Connect'} 
                disabled={props.connected}
                onClick={showModal} 
                highlight={false}
                customStyle={styles.btnStyle}
            />
            {
                props.connected && 
                    <WebThemedButton
                        text={'Disconnect'} 
                        disabled={false}
                        onClick={props.onDisconnect} 
                        highlight={false}
                        customStyle={styles.btnStyle}
                    />
            }
            <ConnectModal 
                showModal={showModal} 
                hideModal={hideModal} 
                isModalOpen={isModalOpen}
                metaMaskConnect={props.onConnect}
                walletConnect={props.wcConnect}
                connected={props.connected}
            />
        </>
       
    );
}

//@ts-ignore
const themedStyles = (theme) => ({
    btnStyle: {
        padding: '1rem'
    }
})

function StakingSidePane (props:{isOpen:boolean,dismissPanel:() => void}&NavBarProps){
    return (
        <Panel
            isOpen={props.isOpen}
            onDismiss={props.dismissPanel}
            type={PanelType.medium}
            closeButtonAriaLabel="Close"
            isLightDismiss={true}
            headerText="Recent Staking Transactions"
        >
        {
            props.stakeEvents.length > 0 ?
                props.stakeEvents.map((e, idx) => (
                    <Transactions
                        key={idx}
                        type={e.type || 'stake'}
                        amount={e.amountStaked}
                        symbol={e.symbol}
                        status={e.transactionStatus}
                        contractName={e.contractName}
                        createdAt={e.createdAt}
                        reward={e.amountOfReward}
                        rewardSymbol={e.rewardSymbol || e.symbol}
                        url={Utils.linkForTransaction(e.network, e.mainTxId)}
                    />
                )) :   <Label disabled> You do not have any recent Transactions</Label>
            }
        </Panel>
    )
}

export const ConnectButtonContainer = connect(
  mapStateToProps, mapDispatchToProps)(ConnectButton);

export const SidePaneContainer = connect(
mapStateToProps, mapDispatchToProps)(StakingSidePane);
