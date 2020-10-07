import React from 'react';

// @ts-ignore
export const List = ({value,label}) => {
    return (
        <div className="listItem">
            <div className ="ListLabel" >
                {label}
            </div>
            <div className ="ListValue">
                {value}
            </div>
        </div>
    )
}