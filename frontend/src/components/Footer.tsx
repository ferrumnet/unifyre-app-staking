import React,{useContext} from 'react';
import {ThemeContext} from 'unifyre-react-helper';


export const Footer = (props: {children: any, htmlFooter?: string}) => {    
    const theme = useContext(ThemeContext);    
    const footer = props.htmlFooter ? (
        <div dangerouslySetInnerHTML={{ __html: props.htmlFooter }} ></div>
    ) : undefined;
    return (
        <div className="footer">
            {footer}
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