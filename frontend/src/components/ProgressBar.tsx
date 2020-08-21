import React from 'react';

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
  
    const labelStyles = {
      padding: 5,
      color: 'white',
      fontWeight: "bold" as "bold"
    }
  
    return (
      <div style={containerStyles}>
        <div style={fillerStyles}>
        </div>
      </div>
    );
  };
  

export const RewardsBar = (props:{bgcolor:string,completed: number}) => {
    const { bgcolor, completed } = props;
  
    const containerStyles = {
      height: 45,
      width: 'auto',
      backgroundColor: "#1a1a1a",
      borderRadius: 10,
      margin: '10px 30px',
      display: 'flex'
    }

    const labelContainer = {
        height: 25,
        width: 'auto',
        borderRadius: 20,
        margin: '10px 50px',
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
      fontSize: '30px',
      letterSpacing: '2px'
    }

    const rewardsLabel = {
        fontWeight: "bolder" as "bolder",
        fontFamily: 'Sawarabi Gothic',
        fontSize: '1.45rem',
        width: '50%',
        letterSpacing: '2px',
        textAlign: "center" as "center"
    }

    const smallerRewardsLabel = {
        fontWeight: "bolder" as "bolder",
        fontFamily: 'Sawarabi Gothic',
        fontSize: '0.85rem',
        width: '50%',
        letterSpacing: '1px',
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
            <div style={fillerStyles}>
            <span style={labelStyles}>{`${completed}%`}</span>
            </div>
            <div style={fillersStyles}>
                <span style={labelStyles}>{`${completed}%`}</span>
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