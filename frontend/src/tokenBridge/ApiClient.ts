import { JsonRpcRequest } from "ferrum-plumbing";
import { UnifyreExtensionKitClient } from "unifyre-extension-sdk";
import { logError } from "../common/Utils";

export abstract class ApiClient {
    protected jwtToken: string = '';
    private token: string = '';
    constructor(
        protected client: UnifyreExtensionKitClient,
        protected backend: string,
    ) { }

    protected async api(req: JsonRpcRequest): Promise<any> {
        try {
            const res = await fetch(this.backend, {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify(req),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.jwtToken}`
                },
            });
            const resText = await res.text();
            if (Math.round(res.status / 100) === 2) {
                return resText ? JSON.parse(resText) : undefined;
            }
            const error = resText;
            let jerror: any;
            try {
                jerror = JSON.parse(error);
            } catch (e) { }
            logError('Server returned an error when calling ' + req + JSON.stringify({
                status: res.status, statusText: res.statusText, error}), new Error());
            throw new Error(jerror?.error ? jerror.error : error);
        } catch (e) {
            logError('Error calling api with ' + JSON.stringify(req), e);
            throw e;
        }
    }
}