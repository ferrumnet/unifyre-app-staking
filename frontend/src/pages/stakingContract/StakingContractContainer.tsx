import React, {useContext} from 'react';
import {
    Page,PageTopPart,  Row, ThemedText, Gap, ThemedButton, ThemedLink, InputGroupAddon,
    // @ts-ignore
} from 'unifyre-web-components';
import { useHistory } from 'react-router-dom';
import { dataFormat, Utils } from "../../common/Utils";
import { connect } from 'react-redux';
import { StakingContract, StakingContractDispatch, StakingContractProps } from './StakingContract';
import { LoaderContainer } from '../../components/Loader';
import { buildStyles,CircularProgressbarWithChildren} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {ThemeContext, Theme} from 'unifyre-react-helper';
import {RewardsBar, StakeCompletionProgress} from "./../../components/ProgressBar";
import { StakingApp } from '../../common/Types';

function PreStakingView(props: StakingContractProps&StakingContractDispatch) {
    return (
        <Row withPadding>
            <ThemedText.H3>{'Starting Soon.'}</ThemedText.H3>
            <ThemedText.H3>
                {'Staking starts at ' + dataFormat(props.contract.stakingStarts)}
            </ThemedText.H3>
        </Row>
    );
}

function MoreStakingDetails(props: {contract: StakingApp}) {
    return (
        <>
        <Row withPadding>
            <ThemedText.SMALL>STAKING ENDS</ThemedText.SMALL>
        </Row>
        <Row withPadding>
            <ThemedText.P>{dataFormat(props.contract.stakingEnds)}</ThemedText.P>
        </Row>
        <Row withPadding>
            <ThemedText.SMALL>EARLY WITHDRAW STARTS</ThemedText.SMALL>
        </Row>
        <Row withPadding>
            <ThemedText.P>{dataFormat(props.contract.withdrawStarts)}</ThemedText.P>
        </Row>
        <Row withPadding>
            <ThemedText.SMALL>MATURITY</ThemedText.SMALL>
        </Row>
        <Row withPadding>
            <ThemedText.P>{dataFormat(props.contract.withdrawEnds)}</ThemedText.P>
        </Row>
        <Row withPadding>
            <ThemedText.P>+ Maturity rewards will usually be MORE than the advertised number.
                This is because any rewards left due to early withrawals will be distributed to the 
                people who waited until maturity. By staying until maturity you will be usually pleasantly surprised.
            </ThemedText.P>
        </Row>
        </>
    );
}

function StakingView(props: StakingContractProps&StakingContractDispatch) {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    const history = useHistory();
    const {symbol} = props;
    return (
            <>
                <>
                    <Gap size={'small'}/>
                    {
                        (props.userStake?.amountInStake === '0') && 
                        (
                            <Row withPadding>
                                <ThemedText.H1 style={{...styles.header}}>{`Start staking ${props.symbol} right now`}</ThemedText.H1>
                            </Row>
                        )
                    }
                    <Row withPadding noMarginTop>
                        <ThemedText.H3 style={{width: '80%',fontSize:'13px',marginLeft:'15pt'}}>{'Simple, secure and dynamic the way to start Winning Today'}</ThemedText.H3>
                    </Row>
                    <Row centered>
                        <Row centered>
                            {
                                props.userStake?.amountInStake != '0' && 
                                <>
                                     <div style={{...styles.stakedText}}>
                                        <Row centered noMarginTop><ThemedText.H4 style={{...styles.stakingInfoHeader}}>{'You Staked'}</ThemedText.H4></Row>
                                        <ThemedText.H1 style={{...styles.stakingAmountStyle}}>{props.userStake?.amountInStake}</ThemedText.H1>
                                        <div><ThemedText.H4 style={{...styles.stakingSymbol}}>{props.symbol}</ThemedText.H4></div>
                                    </div>
                                </>
                            }
                            {
                                props.userStake?.amountInStake === '0' && 
                                <>
                                     <div style={{...styles.stakedText}}>
                                        <Row centered noMarginTop><ThemedText.H2 style={{...styles.stakingInfoHeader}}>{'You Have'}</ThemedText.H2></Row>
                                        <ThemedText.H1 style={{...styles.stakingAmountStyle}}>{props.balance}</ThemedText.H1>
                                        <div><ThemedText.SMALL style={{...styles.stakingSymbol}}>{`${props.symbol} available to stake`}</ThemedText.SMALL></div>
                                    </div>
                                </>
                            }
                           
                        </Row>
                        <div style={{...styles.percentStake}}>
                                <CircularProgressbarWithChildren
                                strokeWidth = {2}
                                styles={buildStyles({
                                    // Rotation of path and trail, in number of turns (0-1)
                                    rotation: 2.25,
                                
                                    // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                                    strokeLinecap: 'butt',

                                
                                    // Text size
                                    textSize: '10px',
                            
                                    // How long animation takes to go from one percentage to another, in seconds
                                    pathTransitionDuration: 50.5,
                                
                                    // Can specify path transition in more detail, or remove it entirely
                                    // pathTransition: 'none',
                                
                                    // Colors
                                    pathColor: `rgba(249, 64, 43, 1)`,
                                    textColor: '#ffffff',
                                    trailColor: 'rgb(214 214 214 / 12%)',
                                    backgroundColor: 'rgb(214 214 214 / 12%)',
                                })} 
                                value={props.stakeCompletionRate}
                                >
                                    <Row noMarginTop><ThemedText.H2 style={{...styles.commonText,...styles.smallerMediumText}}>{'REMAINING'}</ThemedText.H2></Row>
                                    <ThemedText.H2 style={{...styles.commonText,...styles.mediumText}}>{props.remaining}</ThemedText.H2>
                                    <ThemedText.H4 style={{...styles.unifyreTextColor,...styles.littleText}}>{'CAPACITY'}</ThemedText.H4>
                                </CircularProgressbarWithChildren>;
                            </div>
                        </Row>
                        <Gap/>
                        <Gap/>
                            <RewardsBar bgcolor={'rgba(249, 64, 43, 1)'} {...props} />
                        <Gap/>
                        <Row withPadding>
                            <ThemedText.SMALL>Time Elapsed in staking so far</ThemedText.SMALL>
                        </Row>
                        <Row withPadding>
                            <StakeCompletionProgress completion={props.stakingTimeProgress} />
                        </Row>
                        <Row withPadding>
                            <ThemedButton
                                highlight={true}
                                text={
                                    props.filled ? 'Filled' :
                                        props.userStake?.amountInStake === '0' ? `Start Winning` : `Stake More ${symbol}`}
                                onClick={() => props.onContractSelected(history,props.contract.network,props.contract.contractAddress,false)}
                                disabled={props.filled}
                                textStyle={{...styles.mediumText,...styles.btnText}}
                            />
                        </Row>
                        <Gap size={'small'}/>
                        <Gap size={'small'}/>
                        <MoreStakingDetails contract={props.contract} />
                </>
            </>
    )
}

function WithdrawView(props: StakingContractProps&StakingContractDispatch) {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    const history = useHistory();
    const [tillMon, tillDay, tillHour] = Utils.tillDate(props.contract.withdrawEnds);
    return (
        <>
            <>
                <>
                    <Row centered>
                        <Row centered>
                            <>
                                    <div style={{...styles.stakedText}}>
                                    <Row centered noMarginTop><ThemedText.H4 style={{...styles.stakingInfoHeader}}>{'You Staked'}</ThemedText.H4></Row>
                                    <ThemedText.H1 style={{...styles.stakingAmountStyle}}>{props.userStake?.amountInStake}</ThemedText.H1>
                                    <div><ThemedText.H4 style={{...styles.stakingSymbol}}>{props.symbol}</ThemedText.H4></div>
                                </div>
                            </>
                        </Row>
                            <div style={{...styles.percentStake}}>
                                <CircularProgressbarWithChildren
                                strokeWidth = {2}
                                styles={buildStyles({
                                    // Rotation of path and trail, in number of turns (0-1)
                                    rotation: 2.25,
                                
                                    // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                                    strokeLinecap: 'butt',

                                
                                    // Text size
                                    textSize: '10px',
                            
                                    // How long animation takes to go from one percentage to another, in seconds
                                    pathTransitionDuration: 1,
                                
                                    // Can specify path transition in more detail, or remove it entirely
                                    // pathTransition: 'none',
                                
                                    // Colors
                                    pathColor: `rgba(249, 64, 43, 1)`,
                                    textColor: '#ffffff',
                                    trailColor: 'rgb(214 214 214 / 12%)',
                                    backgroundColor: 'rgb(214 214 214 / 12%)',
                                })} 
                                value={100 * props.maturityProgress}
                                >
                                    <Row noMarginTop><ThemedText.H2 style={{...styles.commonText,...styles.smallerMediumText}}>{'MATURITY'}</ThemedText.H2></Row>
                                    <ThemedText.H2 style={{...styles.commonText,...styles.mediumText}}>{tillMon + ' months'}</ThemedText.H2>
                                    <ThemedText.H4 style={{...styles.unifyreTextColor,...styles.littleText}}>{tillDay + ' days'}</ThemedText.H4>
                                </CircularProgressbarWithChildren>;
                            </div>
                        </Row>
                        <Gap/>
                    <Row withPadding>
                        <ThemedText.H4>Rewards if un-staked today</ThemedText.H4>
                    </Row>
                    <Row withPadding>
                      <InputGroupAddon
                          value={props.unstakeRewardsNow}
                          disabled={true}
                      />
                    </Row>
                    <Row withPadding>
                        <ThemedText.H4>Rewards at maturity</ThemedText.H4>
                    </Row>
                    <Row withPadding>
                      <InputGroupAddon
                          value={props.unstakeRewardsMaturity}
                          disabled={true}
                      />
                    </Row>
                    <Row withPadding>
                        <ThemedText.H4>Early withdraw starts</ThemedText.H4>
                    </Row>
                    <Row withPadding>
                      <InputGroupAddon
                          value={dataFormat(props.contract.withdrawStarts)}
                          disabled={true}
                      />
                    </Row>
                    <Row withPadding>
                        <ThemedText.H4>Maturity</ThemedText.H4>
                    </Row>
                    <Row withPadding>
                      <InputGroupAddon
                          value={dataFormat(props.contract.withdrawEnds)}
                          disabled={true}
                      />
                    </Row>

                    <div style={styles.bottomFix}>
                        <Row withPadding>
                            <ThemedButton
                                highlight={true}
                                disabled={props.state !== 'withdraw' && props.state !== 'maturity'}
                                text={`Un stake`}
                                onClick={() => props.onContractSelected(history,props.contract.network,props.contract.contractAddress,true)}
                                textStyle={{...styles.mediumText,...styles.btnText}}
                            />
                        </Row>
                    </div>
                </>
            </>
        </>
    )
}

function StakingContractComponent(props: StakingContractProps&StakingContractDispatch) {
    const history = useHistory();
    let mainPart = (<> </>);
    switch (props.state) {
        case 'pre-stake':
            mainPart = (<PreStakingView {...props}/>);
            break;
        case 'stake':
            mainPart = (<StakingView {...props}/>);
            break;
        case 'pre-withdraw':
        case 'maturity':
        case 'withdraw':
            mainPart = (<WithdrawView {...props}/>);
            break;
    }

    return (
        <Page>
            <LoaderContainer />
            <PageTopPart>
                <Row withPadding centered>
                    <ThemedText.H2>{props.contract.name}</ThemedText.H2>
                </Row>
                <Gap />
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
        fontSize: '14px',
        fontWeight: 'bold',
        letterspacing: 1.5,
        lineHeight: '1.2'
    },
    listText: { 
        fontSize: '14px',
        letterspacing: 1,
        lineHeight: '1.2'
    },
    btnText: {
        color: '#ffffff',
        lineHeight:1.3
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
        justifyContent: 'center',
        paddingLeft: theme.get(Theme.Spaces.screenMarginVertical),
        paddingRight: theme.get(Theme.Spaces.screenMarginVertical),
        width: '30%'
    },
    dateValue:{
        marginTop: theme.get(Theme.Spaces.line),
        display: 'flex',
        flexDirection: "row" as "row",
        justifyContent: 'space-between',
        paddingLeft: theme.get(Theme.Spaces.screenMarginVertical),
        width: '50%'
    },
    btnContainer: {
        display: 'flex',
        color: 'black',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '15px',
        fontSize: '15px'
    },
    miniText: {
        fontSize: '14px',
    },
    symb:{
        fontSize: '17px',
    },
    rewards:{
        backgroundColor: 'white',
        color: '#c1052a',
        textAlign: "center" as "center",
        borderRadius: '5px',
        fontSize: '17px',
        fontWeight: "bold" as "bold",
        margin: '5px 0px',
        padding: '2px 0px'
    },
    tokenInfo: {
        display: 'flex',
        color: 'white',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    tokenSymbol: {
        margin: '0px 10px'
    },
    listContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
    },
    listItemContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        minHeight: theme.get(Theme.Spaces.line) * 4,
        padding: theme.get(Theme.Spaces.line),
    },
    stakedText:{
        fontFamily: 'Sawarabi Gothic',
        marginTop: 'auto',
        margin: '3px',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: "center" as "center",
        lineHeight: 1
    },
    commonText: {
        fontFamily: 'Sawarabi Gothic',
        fontWeight: 'bold',
        fontSize: '16.5px',
        letterSpacing: '1px'
    },
    unifyreTextColor: {
      color:  '#9a3531'
    },
    stakingAmountStyle: {
        color: '#ffff',
        fontSize: '30px',
        lineHeight: 1,
        fontWeight: '900',
        letterSpacing: '3px'
    },
    stakingSymbol:{
        paddingTop: '3px',
        letterSpacing: 1,
        fontSize:'11px',
        fontWeight: 200
    },
    unifyreMainTextlineHeight: {
        lineHeight: 0.9
    },
    smallerMediumText:{
        fontSize: '14px',
        letterSpacing: '1px',
        lineHeight: '0.8',
        fontWeight: 200
    },
    navHeader: {
        fontSize: '17px',
        lineHeight: 1
    },
    mediumText: {
        fontSize: '25px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        lineHeight: '1.4'
    },
    mediumTextRow: {
        fontSize: '18px',
        fontWeight: 'bold',
        letterSpacing: '2px',
    },
    littleText: {
        fontSize: '10.5px',
        fontWeight: '200'
    },
    percentStake: {
        textAlign: "center" as "center",
        marginTop: '15px',
        marginRight: '10px',
        marginLeft: '20px',
        marginBottom: '2px',
        width:'50%',
        display: 'flex',
        flexDirection: "row" as "row",
    },
    percentStakeRow: {
        width: '60%',
        display: 'flex',
        flexDirection: 'row' as 'row',
        margin: '25px auto',
        marginBottom: '10px'
    },
    arrows: {
        marginRight: '10px',
        marginLeft: '10px',
        width: '16px'
    },
    highlight:{
        color: 'rgb(255, 59, 47)'
    },
    DurText: {
        fontSize: '12.5px' 
    },
    bottomFix:{
        width: '99%',
    },
    header: {
        fontSize: '33px',
        width: '80%',
        lineHeight: 1.1,
        marginLeft: '15pt',
        fontWeight: 'bold'
    },
    preStakingheader: {
        fontSize: '40px',
        width: '100%',
        lineHeight: 0.7,
        marginLeft: '15pt',
        marginTop: '20pt',
        textAlign:'center'
    },
    summaryContainerFlex: {
        marginTop: '15px',
        display: 'flex',
        flexDirection: 'row' as 'row',
        justifyContent: 'center' as 'center',
        alignItems: 'center' as 'center'
    },
    summaryContainerRow: {
        marginTop: '15px',
        flexDirection: 'row' as 'row',
        justifyContent: 'center'  as 'center',
        alignItems: 'center' as 'center'
    }
});