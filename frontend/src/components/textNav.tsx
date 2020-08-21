import React from 'react';
import {
    Row, ThemedText
    // @ts-ignore
} from 'unifyre-web-components';
import right from './../images/right-arrow.png'; // Tell webpack this JS file uses this image
import logo from './../images/left-arrow.png'; // Tell webpack this JS file uses this image
import { StakingApp } from "./../common/Types";

//@ts-ignore
export const Textnav = (props:{index:number,onclick:(v:number)=>void,stakingPlans:StakingApp[],styles,tokenName}) => {
    const {index,onclick,stakingPlans,styles,tokenName} = props;
    return (
        <Row withPadding centered>
            <img onClick={()=> index != 0 && onclick(index-1)} style={styles.arrows} src={logo} alt="Logo" />
            <ThemedText.H2 style={{...styles.commonText,...styles.smallerMediumText,...styles.navHeader}}>{tokenName}</ThemedText.H2>
            {
                index != stakingPlans.length && 
                <img onClick={()=>onclick(index+1)} style={styles.arrows} src={right} alt="Logo" />
            }
        </Row>
    )
}