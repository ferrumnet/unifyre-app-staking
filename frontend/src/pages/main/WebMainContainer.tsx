import React, {useContext} from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
    Page,PageTopPart,  Row, ThemedText, Gap,
    // @ts-ignore
} from 'unifyre-web-components';
import { Button, Label, Provider, Text , teamsTheme} from '@fluentui/react-northstar';
import { Main, MainDispatch, MainProps } from './Main';
import 'react-circular-progressbar/dist/styles.css';
import {ThemeContext, Theme} from 'unifyre-react-helper';
import {CategoryBtn} from "../../components/WebCategories";
import { StakingApp } from "../../common/Types";
import {Transactions} from '../../components/transactions';
import { Utils } from '../../common/Utils';
import './web_main.scss';

function MainComponent(props: MainProps&MainDispatch) {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    
    const history = useHistory();
    const {stakings} = props;

    const recentTx = props.stakeEvents && props.stakeEvents.length ? (
        <>
            <Row withPadding>
                <ThemedText.H4>{'Recent Transactions'}</ThemedText.H4>
            </Row>
            <Gap size={'small'}/>
            {
                props.stakeEvents.length > 0 &&
                    props.stakeEvents.map((e, idx) => (
                        <Transactions
                            key={idx}
                            type={'stake'}
                            amount={e.amountStaked}
                            symbol={e.symbol}
                            status={e.transactionStatus}
                            contractName={e.contractName}
                            createdAt={e.createdAt}
                            reward={e.amountOfReward}
                            rewardSymbol={e.rewardSymbol || e.symbol}
                            url={Utils.linkForTransaction(e.network, e.mainTxId)}
                        />

                    ))
            }
            {
                props.stakeEvents.length === 0 && 
                <Row withPadding>
                <div className="btnContainer">
                    You Have Made No Recent Transactions 
                </div>
                </Row>
            }
        </>
    ) : undefined;

    
    return (
        <Page>
            <Gap size={'small'}/>
            {
                stakings.map((e:StakingApp, i: number) => 
                        <CategoryBtn
                            key={i}
                            staking={e}
                            userAddress={props.userAddress}
                            onStakeNow={()=>props.onContractSelected(history, e, props.userAddress)}
                        />)
            }
            <Gap/>
            {recentTx}
        </Page>
     
    );
}

//@ts-ignore
const themedStyles = (theme) => ({
   
});

export const MainContainer = connect(
  Main.mapStateToProps, Main.mapDispatchToProps)(MainComponent);