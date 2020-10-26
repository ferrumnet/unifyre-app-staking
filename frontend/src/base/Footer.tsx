import React from 'react';


export const Footer = (props: {children: any, htmlFooter?: string}) => {    
    const footer = props.htmlFooter ? (
        <div dangerouslySetInnerHTML={{ __html: props.htmlFooter }} ></div>
    ) : undefined;
    return (
        <div className="footer">
            {footer}
        </div>
    )
}