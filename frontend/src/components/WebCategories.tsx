import React, {useContext, useState} from 'react';
import {
    Row
    // @ts-ignore
} from 'unifyre-web-components';
import {Theme, ThemeContext} from 'unifyre-react-helper';
import {formatter,Utils} from '../common/Utils';
import { StakingApp } from "../common/Types";
import { ProgressBar, } from './ProgressBar';
// import ProgressBar from 'react-bootstrap/ProgressBar';
import './categories_view.scss';

interface categoryBtnProps {
    staking: StakingApp,
    userAddress:string
    onStakeNow: () => void
}

export const CategoryBtn = (props:categoryBtnProps) => {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    const [expand, setExpand] = useState(false);
    const rewards = Utils.stakingRewards(props.staking);
    const staking = props.staking;
    const maturitySentence = Utils.rewardSentence(rewards.maturityAnnual, rewards);
    const withdrawSentence = Utils.rewardSentence(rewards.earlyWithdrawAnnual, rewards);
    let btn = (
        <></>
    );
    const state = Utils.stakingState(staking);
    switch (state) {
        case 'stake':
            if (props.staking.filled) {
                btn = (
                    <a 
                        className="rewards-btn"
                        style={styles.buttonDisabled}
                        onClick={() => props.onStakeNow()}
                    >
                        Filled
                    </a>
                );
            } else {
                btn = (
                    <a 
                        className="rewards-btn"
                        style={styles.button}
                        onClick={() => props.onStakeNow()}
                    >
                        Stake Now
                    </a>
                );
            }
            break;
        case 'pre-withdraw':
        case 'withdraw':
        case 'maturity':
            btn = (
                <a 
                className="rewards-btn"
                    style={styles.button}
                    onClick={() => props.onStakeNow()}
                >
                    View
                </a>
            );
            break;
    }
    const backgroundStyle = props.staking.backgroundImageDesktop ? {...styles.containerBackgroundImage,
        backgroundImage: `url("${props.staking.backgroundImageDesktop}")`} : {};
    
    const numbers = !!props.staking.rewardCurrency &&
        props.staking.rewardCurrency !== props.staking.currency ? (
            <>
                <div className="percent-wrapper-vertical">
                <div className="percent">
                    <div className="symb">
                        {`${maturitySentence.split(' ')[0]}`}
                    </div>
                    <div className="symb symb-token">
                        {`${maturitySentence.split(' ')[1]}`}
                    </div>
                    <span className="number-desc">STARTING<br/>APY</span>
                </div>
                <div className="percent">
                    <div className="symb-mini">
                        {`${maturitySentence.split(' ')[0]} `}
                    </div>
                    <div className="symb-mini symb-token">
                        {`${maturitySentence.split(' ')[1]}`}
                    </div>
                    <span className="number-desc-mini">EARLY<br/>REWARD</span>
                </div>
                </div>
            </>
        ) : (
            <>
                <div className="percent">
                    <div className="symb">
                        {`${maturitySentence}`}
                    </div>
                    <span className="number-desc">STARTING<br/>APY</span>
                </div>
                <div className="percent">
                    <div className="symb">
                        {`${withdrawSentence}`}
                    </div>
                    <span className="number-desc">EARLY<br/>REWARD</span>
                </div>
            </>
        );

    return (
        <div className="web-categories">
        <Row noMarginTop>
            <div style={
                    Object.assign({...styles.Container}, staking.color ? { backgroundColor: staking.color, }
                        : {}, backgroundStyle)}
                    className={`${expand ? 'container' : 'collapsed'}`}
                    
            >
                <div className="btnContainer">
                    <a className="tokenInfo">
                        {/* <div className="tokenSymbol">
                            <img
                                style={{"width":'50px'}}
                                src={staking.logo || Utils.icon(staking.currency)}
                            />
                        </div> */}
                        <div className="cat_text_container">
                            <div className="cat_categoryText">
                                {Utils.ellipsis(props.staking.name, 30)}
                            </div>
                        </div>
                    </a> 
                    {numbers}
                </div>
                <div className="stakingCapText">
                    {formatter.format(props.staking.stakingCap, true)} {props.staking.symbol}
                    {btn}
                </div>
                <div className="progessBarContainer">
                    <ProgressBar completed={100 * Utils.stakeProgress(props.staking)} bgcolor={'white'}></ProgressBar>
                </div>
            </div>
        </Row>
        </div>
       
    )
}

//@ts-ignore
const themedStyles = (theme) => ({
    Container: {
        display: 'relative',
        borderRadius: '20px',
        width: '100%',
        marginBottom: '25px',
        boxShadow: '0 0 15px 0 ' + theme.get(Theme.Colors.textColor),
        padding: '30px',
        minHeight: '300px',
    },
    containerBackgroundImage: {
        backgroundImage: '',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
    },
    button: {
        backgroundColor: theme.get(Theme.Button.btnPrimary),
        color: theme.get(Theme.Button.btnPrimaryTextColor),
    },
    buttonDisabled: {
        backgroundColor: theme.get(Theme.Button.inverseBtnPrimary),
        color: theme.get(Theme.Button.inverseBtnPrimaryTextColor),
    }
});