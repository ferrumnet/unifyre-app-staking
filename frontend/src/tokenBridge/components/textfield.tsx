import React from 'react';
import { TextField,IMaskedTextFieldProps } from 'office-ui-fabric-react';

export function BridgeTextfield (props: IMaskedTextFieldProps){
    return (
        <TextField
            {...props}
        />
    )
}