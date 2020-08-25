import { AnyAction, Dispatch } from "redux";
import { RootState } from "../../common/RootState";
import { StakingApp } from "../../common/Types";
import { History } from 'history';
import { StakingAppClient } from "../../services/StakingAppClient";
import { inject } from "../../common/IocModule";
import { StakeEvent } from "../../common/Types";

export interface MainProps {
    symbol: string;
    userAddress: string;
    stakings: StakingApp[];
    currency: string,
    stakeEvents: StakeEvent[]
}

export interface MainDispatch {
    onContractSelected: (history: History, contract: StakingApp, userAddress: string) => void;
}

function mapStateToProps(state: RootState): MainProps {
    const userProfile = state.data.userData?.profile;
    const addr = userProfile?.accountGroups[0]?.addresses || {};
    const address = addr[0] || {};
    return {
        symbol: address.symbol,
        userAddress: address.address,
        stakings: state.data.stakingData.contracts,
        currency: address.currency,
        stakeEvents: state.data.stakingData.stakeEvents
    };
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
    onContractSelected: async (history, contract, userAddress) => {
        const client = inject<StakingAppClient>(StakingAppClient);
        const res = await client.selectStakingContract(dispatch, contract.network,
            contract.contractAddress, userAddress);
        if (!!res) {
            history.push('/info/' + contract.contractAddress);
        }
    }
} as MainDispatch);

export const Main = ({
    mapDispatchToProps,
    mapStateToProps,
});