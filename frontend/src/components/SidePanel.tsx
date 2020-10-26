import React from 'react';
import { connect } from 'react-redux';
import { StakeEvent } from "../common/Types";
import {Transactions} from './transactions';
import { Utils } from '../common/Utils';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { RootState } from '../common/RootState';

export interface SidePanelProps {
    stakeEvents: StakeEvent[];
}

export function mapStateToProps(state: RootState): SidePanelProps {
    return {
        stakeEvents: state.data.stakingData.stakeEvents,
    };
}

function StakingSidePane (props:{isOpen:boolean,dismissPanel:() => void}&SidePanelProps){
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

export const SidePaneContainer = connect(
mapStateToProps, () => {})(StakingSidePane);
