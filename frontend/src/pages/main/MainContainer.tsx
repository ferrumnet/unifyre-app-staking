import React, {useContext, useState} from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
    Page,PageTopPart,  Row, ThemedText, Gap, ThemedButton
    // @ts-ignore
} from 'unifyre-web-components';
import { Main, MainDispatch, MainProps } from './Main';
import { buildStyles,CircularProgressbarWithChildren} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {ThemeContext, Theme} from 'unifyre-react-helper';
import logo from './../../images/left-arrow.png'; // Tell webpack this JS file uses this image
import right from './../../images/right-arrow.png'; // Tell webpack this JS file uses this image
import {RewardsBar,ProgressBar} from "./../../components/ProgressBar";
import {Textnav} from "./../../components/textNav";

function MainComponent(props: MainProps&MainDispatch) {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    const history = useHistory();
    let [index,setindex] = useState(0);
    
    return (
        <Page>
            <PageTopPart>
                <Row centered><ThemedText.H2 styles={{...styles.stakingInfoHeader}}>{`Staking`}</ThemedText.H2></Row>
                <div style={{...styles.divider}}></div>
                <Gap/>
                <Row withPadding centered>
                    <ThemedText.H3 >{`Start staking`}</ThemedText.H3>
                </Row> 
            </PageTopPart>
            <Gap size={"small"}/>
            <Textnav index = {index} onclick = {setindex} stakingPlans = {props.stakings} styles = {styles} tokenName = {props.stakings[index].tokenName.toUpperCase()}/>
            <Row centered>
                <Row centered>
                    <div style={{...styles.stakedText}}>
                        <Row centered noMarginTop><ThemedText.H2 style={{...styles.stakingInfoHeader}}>{'YOU STAKED'}</ThemedText.H2></Row>
                        <ThemedText.H1 style={{...styles.stakingAmountStyle}}>{'190.000'}</ThemedText.H1>
                        <div><ThemedText.H4 style={{...styles.stakingSymbol}}>{props.symbol}</ThemedText.H4></div>
                    </div>
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
                        value={66}
                        >
                            <Row noMarginTop><ThemedText.H2 style={{...styles.commonText,...styles.smallerMediumText}}>{'REMAINING'}</ThemedText.H2></Row>
                            <ThemedText.H2 style={{...styles.commonText,...styles.mediumText}}>{'190,000'}</ThemedText.H2>
                            <ThemedText.H4 style={{...styles.unifyreTextColor,...styles.littleText}}>{'CAPACITY'}</ThemedText.H4>
                        </CircularProgressbarWithChildren>;
                    </div>
                </Row>
                <Gap size={'small'}/>
                <Row centered><ThemedText.H4 style={{...styles.DurText,...styles.commonText,...styles.smallerMediumText}}>{'REMAINING TIME'}</ThemedText.H4></Row>
                <ProgressBar bgcolor={'rgba(249, 64, 43, 1)'} completed={60}/>
                <Gap size={'small'}/>
                <RewardsBar bgcolor={'rgba(249, 64, 43, 1)'} completed={50}/>
                <Row centered>
                    <div style={{...styles.stakedText}}>
                        <Row noMarginTop><ThemedText.H3 style={{...styles.commonText,...styles.DurText}}>{'MATURITY PERIOD'}</ThemedText.H3></Row>
                        <ThemedText.H4 style={styles.littleText}>{'12 MONTHS'}</ThemedText.H4>
                    </div>
                </Row>
                <Gap size={'small'}/>
                <Row withPadding>
                    <ThemedButton
                        highlight={true}
                        text={`Start Winning`}
                        onClick={() => props.onContractSelected(history,props.stakings[index].contractAddress)}
                        textStyle={{...styles.mediumText,...styles.btnText}}
                    />
                </Row>
        </Page>
    );
}

//@ts-ignore
const themedStyles = (theme) => ({
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
    stakingInfoHeader: { 
        justifyContent: 'center',  
        fontSize: '19px',
        fontWeight: 'bold',
        letterspacing: 1,
        lineHeight: '1.2'
    },
    stakingAmountStyle: {
        fontSize: '33px',
        lineHeight: 1,
        fontWeight: 900,
        letterSpacing: '2.4px',
        color:'rgb(255 59 47 / 88%)'
    },
    stakingSymbol:{
        paddingTop: '3px',
        letterSpacing: 1
    },
    unifyreMainTextlineHeight: {
        lineHeight: 0.9
    },
    smallerMediumText:{
        fontSize: '13px',
        letterSpacing: '1px',
        lineHeight: '0.8'
    },
    navHeader: {
        fontSize: '17px',
        lineHeight: 1
    },
    mediumText: {
        fontSize: '25px',
        fontWeight: 'bold',
        letterSpacing: '1px',
        lineHeight: '1.2'
    },
    littleText: {
        fontSize: '12.5px',
        fontWeight: 'bold'
    },
    percentStake: {
        textAlign: "center" as "center",
        marginTop: '15px',
        marginRight: '0px',
        marginLeft: '40px',
        marginBottom: '2px',
        width:'40%',
        display: 'flex',
        flexDirection: "row" as "row",
    },
    arrows: {
        marginRight: '10px',
        marginLeft: '10px',
        width: '16px'
    },
    divider: {
        height: '3px',
        borderTopStyle: "solid" as "solid",
        borderTopColor: 'rgba(249, 64, 43, 1)',
        width: '10%',
        margin: '0px auto',
    },
    highlight:{
        color: 'rgb(255, 59, 47)'
    },
    DurText: {
        fontSize: '12.5px' 
    },
    btnText: {
        color: '#ffffff',
        letterSpacing: 2.5,
        lineHeight:1.6
    }
});

export const MainContainer = connect(
  Main.mapStateToProps, Main.mapDispatchToProps)(MainComponent);