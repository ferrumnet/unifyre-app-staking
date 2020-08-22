import { AnyAction, Dispatch } from "redux";
import { RootState } from "../../common/RootState";
import { StakingApp } from "../../common/Types";

export interface StakingContractProps {
    balance: string;
    symbol: string;
    contract: StakingApp;
    stakedAmount: string;
}

export interface StakingContractDispatch {
}

function mapStateToProps(state: RootState): StakingContractProps {
    const userProfile = state.data.userData?.profile;
    const addr = userProfile?.accountGroups[0]?.addresses || {};
    const address = addr[0] || {};
    return {
        balance: address.balance,
        symbol: address.symbol,
        contract: state.data.stakingData.selectedContract || {} as any,
        stakedAmount: state.data.stakingData.userStake?.amountInStake || '',
    };
}

const mapDispatchToProps = (_: Dispatch<AnyAction>) => ({
} as StakingContractDispatch);

export const StakingContract = ({
    mapDispatchToProps,
    mapStateToProps,
});
