import React, { useContext } from 'react';
import { Theme, ThemeContext } from 'unifyre-react-helper';
import '../pages/stakingContract/Web/staking.scss';

export function LeftBox(props: {children: any}) {
    return (
        <div className="staking-box address-box">
            {props.children}
        </div>
    );
}

export function RightBox(props: {children: any}) {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    return (
        <div className="staking-box staking-box-bordered info-box" style={styles.rightBox}>
            {props.children}
        </div>
    );
}

const themedStyles = (theme:any) => ({
    rightBox: {
        backgroundColor: theme.get(Theme.Colors.bkgShade3),
    },
})