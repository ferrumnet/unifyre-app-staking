import React, {useContext, useEffect} from 'react';
import {
    Page,PageTopPart,  Row, ThemedText, Gap, InputGroupAddon, ThemedButton, ThemedLink,
    // @ts-ignore
} from 'unifyre-web-components';
import { useHistory } from 'react-router-dom';
import { formatter,dataFormat } from "../../common/Utils";
import { connect } from 'react-redux';
import { StakingContract, StakingContractDispatch, StakingContractProps } from './StakingContract';
import { LoaderContainer } from '../../components/Loader';
import {ThemeContext, Theme} from 'unifyre-react-helper';

function PreStakingView(props: StakingContractProps&StakingContractDispatch) {
    return (
        <>
        </>
    )
}

function StakingView(props: StakingContractProps&StakingContractDispatch) {
    const history = useHistory();
    const {contract, symbol} = props;
    const navigateToStakePage = (address:string) => {
        history.replace(`/stake/${address}`);
    }
    return (
        <>
            <Row withPadding>
                <ThemedText.SMALL>{'Total staking Amount'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={`${formatter.format(contract.stakingCap, false)} ${symbol}`}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Staked so far:'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={`${formatter.format(props.stakedAmount,true)} ${props.symbol}`}
                    inputMode={'decimal'}
                    disabled={true}

                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{`Your Available ${symbol} balance :`}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={`${formatter.format(props.balance,false)} ${symbol}`}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Staking Starts'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={dataFormat(contract.stakingStarts)}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Staking Ends'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={dataFormat(contract.stakingEnds)}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Early Withdrawal Starts'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={dataFormat(contract.withdrawStarts)}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Row withPadding>
                <ThemedText.SMALL>{'Withdrawal Ends'}</ThemedText.SMALL>
            </Row>
            <Row withPadding>
                <InputGroupAddon
                    value={dataFormat(contract.withdrawEnds)}
                    inputMode={'decimal'}
                    disabled={true}
                />
            </Row>
            <Gap />
            <Row withPadding>
                <ThemedButton
                    text={`Stake ${symbol}`}
                    disabled={props.state !== 'stake'}
                    onClick={()=>{navigateToStakePage(contract.contractAddress)}}/>
            </Row>
        </>
    )
}

function PreWithdrawView(props: StakingContractProps&StakingContractDispatch) {
    return (
        <>
        </>
    )
}

function WithdrawView(props: StakingContractProps&StakingContractDispatch) {
    return (
        <>
        </>
    )
}

function MaturityView(props: StakingContractProps&StakingContractDispatch) {
    return (
        <>
        </>
    )
}

function StakingContractComponent(props: StakingContractProps&StakingContractDispatch) {
    const history = useHistory();
    let mainPart = (<> </>);
    switch (props.state) {
        case 'pre-stake':
            mainPart = (<PreStakingView {...props} />);
            break;
        case 'stake':
            mainPart = (<StakingView {...props} />);
            break;
        case 'pre-withdraw':
            mainPart = (<PreWithdrawView {...props} />);
            break;
        case 'withdraw':
            mainPart = (<WithdrawView {...props} />);
            break;
        case 'maturity':
            mainPart = (<MaturityView {...props} />);
            break;
    }

    return (
        <Page>
            <LoaderContainer />
            <PageTopPart>
                <Gap />
                <Row withPadding centered>
                    <ThemedText.H3>{`Unifyre ${props.symbol} Staking`}</ThemedText.H3>
                </Row>
                <Row withPadding centered>
                    <ThemedText.H2>{props.contract.name}</ThemedText.H2>
                </Row>
            </PageTopPart>
            {mainPart}
            <Row withPadding centered>
                <ThemedLink text={'Go back'} onClick={() => history.replace('/')} />
            </Row>
            <Gap size={'small'}/>
        </Page>
    );
}

export const StakingContractContainer = connect(
  StakingContract.mapStateToProps, StakingContract.mapDispatchToProps)(StakingContractComponent);

 //@ts-ignore
 const themedStyles = (theme) => ({
    stakingInfoHeader: { 
        justifyContent: 'center',  
        fontSize: '19px',
        fontWeight: 'bold',
        letterspacing: 1,
        lineHeight: '1.2'
    },
    listText: { 
        fontSize: '16px',
        letterspacing: 1,
        lineHeight: '1.2'
    },
    btnText: {
        color: '#ffffff',
        lineHeight:1.6
    },
    divider: {
        height: '3px',
        borderTopStyle: "solid" as "solid",
        borderTopColor: 'rgba(249, 64, 43, 1)',
        width: '10%',
        margin: '0px auto',
    },
    list: {
        marginTop: theme.get(Theme.Spaces.line),
        display: 'flex',
        flexDirection: "row" as "row",
        justifyContent: 'space-between',
        paddingLeft: theme.get(Theme.Spaces.screenMarginVertical),
        paddingRight: theme.get(Theme.Spaces.screenMarginVertical)
    },
    listValue:{
        marginTop: theme.get(Theme.Spaces.line),
        display: 'flex',
        flexDirection: "row" as "row",
        justifyContent: 'space-between',
        paddingLeft: theme.get(Theme.Spaces.screenMarginVertical),
        paddingRight: theme.get(Theme.Spaces.screenMarginVertical),
        width: '20%'
    },
    dateValue:{
        marginTop: theme.get(Theme.Spaces.line),
        display: 'flex',
        flexDirection: "row" as "row",
        justifyContent: 'space-between',
        paddingLeft: theme.get(Theme.Spaces.screenMarginVertical),
        width: '50%'
    }
});

    // var utcSeconds = contract.stakingStarts;
    // const theme = useContext(ThemeContext);
    // const styles = themedStyles(theme);
    // var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    // d.setUTCSeconds(utcSeconds);
    // useEffect(() => {
    //     if (!contract.contractAddress) {
    //       history.replace(`/`);
    //     }
    //   },);
    // const navigateToInfoPage = (address:string) => {
    //     history.replace(`/stake/?${address}`);
    // }
    // const hasStake = true;
    
    // return (
    //     <Page>
    //         <LoaderContainer/>
    //        <PageTopPart>
    //             <Row centered><ThemedText.H2 styles={{...styles.stakingInfoHeader}}>{`${contract.tokenName} Staking`}</ThemedText.H2></Row>
    //             <div style={{...styles.divider}}></div>
    //             <Gap/>
    //         </PageTopPart>
    //         { hasStake &&
    //             <>
    //             <div style={{...styles.list}}>
    //                 <Row>
    //                     <ThemedText.SMALL style={styles.listText}>{`Value of your Stake in Platinum`}</ThemedText.SMALL>
    //                 </Row>
    //                 <div style={styles.listValue}>
    //                     <ThemedText.SMALL style={styles.listText}>{'11 FRM'}</ThemedText.SMALL>
    //                 </div>
    //             </div>
    //             <Gap size={'small'}/>
    //             <div style={{...styles.list}}>
    //                 <Row>
    //                     <ThemedText.SMALL style={styles.listText}>{`Rewards Accumulated so far`}</ThemedText.SMALL>
    //                 </Row>
    //                 <div style={styles.listValue}>
    //                     <ThemedText.SMALL style={styles.listText}>{'0.2 FRM'}</ThemedText.SMALL>
    //                 </div>
    //             </div>
    //             <Gap size={'small'}/>
    //             <div style={{...styles.list}}>
    //                 <Row>
    //                     <ThemedText.SMALL style={styles.listText}>{`Early Withdraw Starts`}</ThemedText.SMALL>
    //                 </Row>
    //                 <div style={styles.dateValue}>
    //                     <ThemedText.SMALL style={styles.listText}>{dataFormat(contract.withdrawStarts)}</ThemedText.SMALL>
    //                 </div>
    //             </div>
    //             <Gap size={'small'}/>
    //             <div style={{...styles.list}}>
    //                 <Row>
    //                     <ThemedText.SMALL style={styles.listText}>{`Maturity Start Date`}</ThemedText.SMALL>
    //                 </Row>
    //                 <div style={styles.dateValue}>
    //                     <ThemedText.SMALL style={styles.listText}>{dataFormat(contract.withdrawStarts)}</ThemedText.SMALL>
    //                 </div>
    //             </div>
    //             <Gap/>
    //             <Row withPadding>
    //                 <ThemedButton
    //                     text={`Stake More ${symbol}`}
    //                     onClick={()=>{navigateToInfoPage(contract.contractAddress)}}
    //                     highlight={true}
    //                     textStyle={styles.btnText}
    //                     />
    //             </Row>
    //             <Row withPadding>
    //                  <ThemedText.SMALL>{'*Unstake is only active, after early withdraw duration as elapsed'}</ThemedText.SMALL>
    //             </Row>
    //             <Row withPadding>
    //                 <ThemedButton
    //                     text={`UnStake ${symbol}`}
    //                     onClick={()=>{props.onContractSelected(history,contract.contractAddress)}}
    //                     />
    //             </Row>
    //             </>
    //         }
    //         <>
    //             {
    //                 !hasStake &&
    //                 <>
    //                     <Row withPadding>
    //                         <ThemedText.SMALL>{'Total staking Amount'}</ThemedText.SMALL>
    //                     </Row>
    //                     <Row withPadding>
    //                         <InputGroupAddon
    //                             value={`${contract.stakingCap} ${symbol}`}
    //                             inputMode={'decimal'}
    //                             disabled={true}
    //                         />
    //                     </Row>
    //                     <Row withPadding>
    //                         <ThemedText.SMALL>{'Staked so far:'}</ThemedText.SMALL>
    //                     </Row>
    //                     <Row withPadding>
    //                         <InputGroupAddon
    //                             value={`${contract.stakedAmount}`}
    //                             inputMode={'decimal'}
    //                             disabled={true}
    //                         />
    //                     </Row>
    //                     <Row withPadding>
    //                         <ThemedText.SMALL>{`Your Available ${symbol} balance :`}</ThemedText.SMALL>
    //                     </Row>
    //                     <Row withPadding>
    //                         <InputGroupAddon
    //                             value={`${formatter.format(props.balance,false)} ${symbol}`}
    //                             inputMode={'decimal'}
    //                             disabled={true}
    //                         />
    //                     </Row>
    //                     <Row withPadding>
    //                         <ThemedText.SMALL>{'Staking Starts'}</ThemedText.SMALL>
    //                     </Row>
    //                     <Row withPadding>
    //                     <InputGroupAddon
    //                         value={dataFormat(contract.stakingStarts)}
    //                         inputMode={'decimal'}
    //                         disabled={true}
    //                     />
    //                 </Row>
    //                     <Row withPadding>
    //                         <ThemedText.SMALL>{'Staking Ends'}</ThemedText.SMALL>
    //                     </Row>
    //                     <Row withPadding>
    //                         <InputGroupAddon
    //                             value={dataFormat(contract.stakingEnds)}
    //                             inputMode={'decimal'}
    //                             disabled={true}
    //                         />
    //                     </Row>
    //                     <Row withPadding>
    //                     <ThemedText.SMALL>{'Early Withdrawal Starts'}</ThemedText.SMALL>
    //                 </Row>
    //                     <Row withPadding>
    //                         <InputGroupAddon
    //                             value={dataFormat(contract.withdrawStarts)}
    //                             inputMode={'decimal'}
    //                             disabled={true}
    //                         />
    //                     </Row>
    //                     <Row withPadding>
    //                         <ThemedText.SMALL>{'Withdrawal Ends'}</ThemedText.SMALL>
    //                     </Row>
    //                     <Row withPadding>
    //                         <InputGroupAddon
    //                             value={dataFormat(contract.withdrawEnds)}
    //                             inputMode={'decimal'}
    //                             disabled={true}
    //                         />
    //                     </Row>
    //                     <Row withPadding>
    //                         <ThemedButton
    //                             text={`Stake ${symbol}`}
    //                             onClick={()=>{navigateToInfoPage(contract.contractAddress)}}
    //                             highlight={true}
    //                             textStyle={styles.btnText}
    //                             />
    //                     </Row>
    //                     <Row withPadding>
    //                         <ThemedButton text={'Cancel'}/>
    //                     </Row>
    //                     <Gap size={'small'}/>
    //                 </>
    //             }
    //         </>
