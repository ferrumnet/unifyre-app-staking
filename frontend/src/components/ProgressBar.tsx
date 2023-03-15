import React from 'react';
import logo from '../images/icon.png';
//@ts-ignore
import ReactProgressBar from '@ramonak/react-progress-bar';

export function StakeCompletionProgress(props: {completion: number, thin?: boolean}) {
  return (
    <ReactProgressBar 
        completed={10}
        bgColor={props.thin ? 'rgb(57, 57, 62)' : "rgb(255, 59, 47)"}
        height={props.thin ? '3.5px' : '12px'}
        labelAlignment={'center'}
        baseBgColor={props.thin ? 'rgb(224, 224, 222)' : '#1b1d1d'}
        labelSize={props.thin ? '0px' : '10px'}
        />
  );
}

export const ProgressBar = (props:{bgcolor:string,completed: number}) => {
    const { bgcolor, completed } = props;
  
    const containerStyles = {
      height: 2.5,
      width: 'auto',
      backgroundColor: "#1a1a1a",
      borderRadius: 50,
      margin: '10px 50px',
    }
  
    const fillerStyles = {
      height: '100%',
      width: `${completed}%`,
      backgroundColor: bgcolor,
      borderRadius: 'inherit',
      textAlign: 'right' as "right"
    }
  
    return (
      <div style={containerStyles}>
        <div style={fillerStyles}>
        </div>
      </div>
    );
  };
  

export const RewardsBar = (props:{bgcolor:string,
    rewardSentence: string, earlyWithdrawSentence: string}) => {
    const { bgcolor } = props;
  
    const containerStyles = {
      height: 40,
      width: '80%',
      backgroundColor: "#1a1a1a",
      borderRadius: 10,
      margin: '10px auto',
      display: 'flex'
    }

    const labelContainer = {
        height: 25,
        width: '80%',
        borderRadius: 20,
        margin: '0px 40px',
        display: 'flex',
        color: '#ffffff',
        justifyContent: 'space-around'
      }
  
    const fillerStyles = {
      height: '100%',
      width: `${50}%`,
      backgroundColor: bgcolor,
      borderRadius: 'inherit',
      textAlign: 'center' as "center",
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex'
    }

    const img = {
      textAlign: 'center' as 'center',
      justifyContent: 'center' as 'center',
      alignItems: 'center' as 'center',
      display: 'flex',
      width: 'auto',
      backgroundColor: 'transparent',
      borderRadius: '50%'
    }

    const fillersStyles = {
        height: '100%',
        width: `${50}%`,
        backgroundColor: "#1a1a1a",
        borderRadius: 'inherit',
        textAlign: 'center' as "center",
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex'
      }
  
    const labelStyles = {
      padding: 5,
      color: 'white',
      fontWeight: "bold" as "bold",
      fontSize: '25px',
      letterSpacing: '1.3px'
    }

    const rewardsLabel = {
        fontWeight: "bolder" as "bolder",
        fontFamily: 'Sawarabi Gothic',
        fontSize: '1.15rem',
        width: '60%',
        letterSpacing: '2px',
        textAlign: "start" as "start",
        paddingLeft: '5%'
    }

    const smallerRewardsLabel = {
        fontWeight: "bolder" as "bolder",
        fontFamily: 'Sawarabi Gothic',
        fontSize: '0.55rem',
        width: '50%',
        letterSpacing: '.5px',
        textAlign: "center" as "center"
    }

    const miniLabel = {
        fontSize: '0.75rem',
    }

    const miniContainer = {
        marginTop: '0rem',
    }
  
    return (
    <>
        <div style={labelContainer}>
            <div style={rewardsLabel}>REWARD</div>
            <div style={smallerRewardsLabel}>
                EARLY <br/> WITHDRAW
            </div>
        </div>
        <div style={containerStyles}>
            <div style={{...fillerStyles,"justifyContent": 'start','paddingLeft': '7%'}}>
            <span style={{...labelStyles,"fontSize": '23.5px',paddingTop:3}}>{`${props.rewardSentence}`}</span>
            </div>
            <div style={{...fillerStyles,...img}}>
            <img style={{"width":'60px','position':'absolute','borderRadius':'50%',backgroundColor: 'black'}} src={logo}/>
            </div>
            <div style={fillersStyles}>
                <span style={{...labelStyles,"fontSize": '23.5px',paddingTop:3}}>{`${props.earlyWithdrawSentence}`}</span>
            </div>
        </div>
        <div style={{...labelContainer,...miniContainer}}>
            <div style={miniLabel}>ANNUALIZED</div>
            <div style={miniLabel}>
                ANNUALIZED
            </div>
        </div>
    </>
    );
  };