import React from 'react';
import '../pages/stakingContract/Web/staking.scss';

export function LeftBox(props: {children: any}) {
    return (
        <div className="staking-box address-box">
            {props.children}
        </div>
    );
}

export function RightBox(props: {children: any}) {
    return (
        <div className="staking-box info-box">
            {props.children}
        </div>
    );
}