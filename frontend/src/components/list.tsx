import React from 'react';

// @ts-ignore
export const List = ({value,lable}) => {
    return (
        <div className="listItem">
            <div className ="ListLabel" >
                {value}
            </div>
            <div className ="ListValue">
                {lable}
            </div>
        </div>
    )
}