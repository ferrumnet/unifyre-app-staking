import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Dispatch, AnyAction } from 'redux';
import { addAction } from '../common/Actions';
import { inject } from '../common/IocModule';
import { RootState } from '../common/RootState';
import { DashboardActions } from '../pages/dashboard/Dashboard';
import { StakingAppClient } from '../services/StakingAppClient';
import { loadThemeForGroup } from '../themeLoader';

interface LoaderParams {
    network: string;
    userAddress: string;
}

interface LoaderDispatch {
    onLoad: (network: string, userAddress: string, contractAddress: string) => Promise<void>;
}

function mapStateToProps(state: RootState): LoaderParams {
    const userProfile = state.data.userData?.profile;
    const addr = userProfile?.accountGroups[0]?.addresses || {};
    const address = addr[0] || {};
    return {
        network: address.network,
        userAddress: address.address,
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onLoad: async (network, userAddress, contratAddress) => {
        try {
            if (!network || !userAddress || !contratAddress) {
                return;
            }
            const client = inject<StakingAppClient>(StakingAppClient);
            await client.selectStakingContract(dispatch, network, contratAddress, userAddress);
        } catch (e) {
        }
    },
} as LoaderDispatch);

function Loader(params: LoaderParams&LoaderDispatch) {
    const { contractAddress } = useParams<{contractAddress: string}>();
    const { network, userAddress, onLoad } = params;
    useEffect(() => {
        if (contractAddress) {
            onLoad(network, userAddress, contractAddress);
        }
    }, [contractAddress, network, userAddress, onLoad]);
    return (
        <>
        </>
    );
}

export const LoaderContainer = connect(
  mapStateToProps, mapDispatchToProps)(Loader);
