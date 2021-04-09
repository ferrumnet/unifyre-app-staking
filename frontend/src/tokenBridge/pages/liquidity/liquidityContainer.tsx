import React from 'react';
import { connect } from 'react-redux';
import { liquidityProps,liquidityDisptach,Liquidity } from './liquidity';
import { Divider } from '@fluentui/react-northstar'

function LiquidityComponent(props: liquidityProps&liquidityDisptach) {
    return (
        <div className="centered-body">
            <>
                <div className=" centered main-header"> Ferrum Token Bridge </div>
                    <div className="body-not-centered swap">
                        <div className="header title">  
                            <div>
                                Manage Liquidity
                                <Divider/>
                            </div>
                            <div>
                                Return
                                <Divider/>
                            </div>
                        </div>
                    </div>
                    <div className="pad-main-body">
                        <div className="space-out liquidity-tabs">
                        <div></div> add liquidity
                            <div className="vert-divider"></div>
                            Remove Liquidity
                        </div>
                    </div>
            </>
        </div>
    )
}

export const LiquidityContainer = connect(
    Liquidity.mapStateToProps,
    Liquidity.mapDispatchToProps
)(LiquidityComponent);