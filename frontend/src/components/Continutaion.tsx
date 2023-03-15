import React, { useEffect } from 'react';
import { Utils } from '../common/Utils';
//@ts-ignore
import { History } from 'history';
import { useHistory } from 'react-router';

export interface ContinuationDispatch {
    onContinuation: (history: History, requestId: string, page: string, payload: any) => void;
}

export function ContinuationComponent(props: ContinuationDispatch) {
    const requestId = Utils.getQueryparam('continuation');
    const history = useHistory();
    useEffect(() => {
        if (requestId) {
            const payload = Utils.getQueryparams();
            const {page} = payload;
            props.onContinuation(history as any, requestId!, page, payload);
        }
    }, [requestId]);
    return (<></>);
}