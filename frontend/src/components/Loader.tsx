import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Dispatch, AnyAction } from 'redux';
import { inject } from '../common/IocModule';
import { RootState } from '../common/RootState';
import { StakingAppClient } from '../services/StakingAppClient';

interface LoaderParams {
    network: string;
    userAddress: string;
    stakingNetwork?:string
}

interface LoaderDispatch {
    onLoad: (network: string, userAddress: string, contractAddress: string,stakingNetwork?: string) => Promise<void>;
}

function mapStateToProps(state: RootState): LoaderParams {
    const userProfile = state.data.userData?.profile;
    const stakingData = state.data.stakingData.selectedContract;
    const addr = userProfile?.accountGroups[0]?.addresses || {};
    const address = addr[0] || {};
    return {
        network: stakingData?.network || address.network,
        userAddress: address.address,
        stakingNetwork: stakingData?.network
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onLoad: async (network, userAddress, contratAddress) => {
        try {
            if (!network || !userAddress || !contratAddress) {
                if (!!contratAddress) {
                    const client = inject<StakingAppClient>(StakingAppClient);
                    await client.selectStakingContractByAddress(dispatch,
                        network,
                        contratAddress);
                }
                return;
            }
            const client = inject<StakingAppClient>(StakingAppClient);
            await client.selectStakingContract(dispatch, network, contratAddress, userAddress);
        } catch (e) {
        }
    },
} as LoaderDispatch);

function Loader(params: LoaderParams&LoaderDispatch) {
    let { network, contractAddress } = useParams<{network: string, contractAddress: string}>();
    console.log('NETWORK GOTO', network, contractAddress)
    const { userAddress, onLoad, stakingNetwork } = params;
    network = network || params.network;
    useEffect(() => {
        if (contractAddress) {
            onLoad(network , userAddress, contractAddress,stakingNetwork);
        }
    }, [contractAddress, network, userAddress, onLoad,stakingNetwork]);
    return (
        <>
        </>
    );
}

export const LoaderContainer = connect(
  mapStateToProps, mapDispatchToProps)(Loader);
