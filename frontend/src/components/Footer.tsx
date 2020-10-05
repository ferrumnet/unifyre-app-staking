import React,{useContext} from 'react';
import {ThemeContext} from 'unifyre-react-helper';


//@ts-ignore
export const Footer = ({children}) => {    
    const theme = useContext(ThemeContext);    
    const styles = themedStyles(theme);

    return (
        <div className="footer">
            <h1>Header Content</h1>
        </div>
    )
}

//@ts-ignore
const themedStyles = (theme) => ({
    container: {
        display: 'flex',
        color: '',
        backgroundColor: '',
        align: 'center',
        padding: ''
    },
    rightNav: {
        width: '15%'
    },
    leftNav: {
        display: 'flex',
        width: '25%'
    }
})