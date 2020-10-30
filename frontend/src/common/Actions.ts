
export const CommonActions = {
    WAITING: 'WAITING',
    WAITING_DONE: 'WAITING_DONE',
    CONTINUATION_DATA_RECEIVED: 'CONTINUATION_DATA_RECEIVED',
    CONTINUATION_DATA_FAILED: 'CONTINUATION_DATA_FAILED',
};

export function addAction(type: string, payload: any) {
    return { type, payload };
}