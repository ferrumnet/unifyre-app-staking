import React, { useContext } from 'react';
import { Theme, ThemeContext } from 'unifyre-react-helper';

// @ts-ignore
export const List = ({value,label}) => {
    const theme = useContext(ThemeContext);
    const styles = themedStyles(theme);
    return (
        <div className="listItem">
            <div className ="ListLabel" >
                <span 
                    style={styles.text}>{label || ''}
                </span>
            </div>
            <div className ="ListValue">
                <span className={value?.length > 10 ? 'staking-info-small-val' : 'staking-info-val'}
                    style={styles.text}>{value || ''}</span>
            </div>
        </div>
    )
}

const themedStyles = (theme:any) => ({
    text: {
        color: theme.get(Theme.Colors.textColor),
    },
})