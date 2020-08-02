import {LambdaHttpRequest, LambdaHttpResponse, UnifyreBackendProxyService} from "aws-lambda-helper";
import {LambdaHttpHandler} from "aws-lambda-helper/dist/HandlerFactory";
import {
    JsonRpcRequest,
    ValidationUtils
} from "ferrum-plumbing";
import { PoolDropService } from "./PoolDropService";
import { PoolDrop } from "./Types";
import Big from 'big.js';

function handlePreflight(request: any) {
    if (request.method === 'OPTIONS' || request.httpMethod === 'OPTIONS') {
        return {
            body: '',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': '*',
            },
            isBase64Encoded: false,
            statusCode: 200 as any,
        };
    }
}

export class HttpHandler implements LambdaHttpHandler {
    constructor(private uniBack: UnifyreBackendProxyService,
        private userSvc: PoolDropService,
        ) { }

    async handle(request: LambdaHttpRequest, context: any): Promise<LambdaHttpResponse> {
        let body: any = undefined;
        const preFlight = handlePreflight(request);
        if (preFlight) {
            return preFlight;
        }
        const req = JSON.parse(request.body) as JsonRpcRequest;
        const headers = request.headers as any;
        const jwtToken = (headers.authorization || headers.Authorization  || '').split(' ')[1];
        const userId = jwtToken ? (await this.uniBack.signInUsingToken(jwtToken)) : undefined;
        request.path = request.path || (request as any).url;
        try {
            switch (req.command) {
                default:
                    return {
                        body: JSON.stringify({error: 'bad request'}),
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Content-Type': 'application/json',
                        },
                        isBase64Encoded: false,
                        statusCode: 401 as any,
                    } as LambdaHttpResponse;
            }
            return {
                body: JSON.stringify(body),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': '*',
                    'Content-Type': 'application/json',
                },
                isBase64Encoded: false,
                statusCode: 200,
            } as LambdaHttpResponse;
        } catch (e) {
            console.error('Error while calling API', req, e);
            return {
                body: JSON.stringify({error: e.toString()}),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': '*',
                    'Content-Type': 'application/json',
                },
                isBase64Encoded: false,
                statusCode: 501 as any,
            } as LambdaHttpResponse;
        }
    }

    async transactionsReceived(req: JsonRpcRequest): Promise<PoolDrop> {
        const {linkId, transactionIds} = req.data;
        validateFieldsRequired({linkId, transactionIds});
        return this.userSvc.addTransactionIds(linkId, transactionIds);
    }

    async getLink(req: JsonRpcRequest): Promise<PoolDrop> {
        const {linkId} = req.data;
        validateFieldsRequired({linkId});
        const pd = await this.userSvc.get(linkId);
        ValidationUtils.isTrue(!!pd, "Link not found");
        return pd!;
    }

    async claim(req: JsonRpcRequest): Promise<PoolDrop> {
        const {token, linkId} = req.data;
        validateFieldsRequired({token, linkId});
        return this.userSvc.claim(token, linkId);
    }

    async cancelLink(userId: string, req: JsonRpcRequest): Promise<PoolDrop> {
        const {linkId} = req.data;
        validateFieldsRequired({userId, linkId});
        return this.userSvc.cancelLink(userId, linkId);
    }

    async createLinkAndRegister(req: JsonRpcRequest): Promise<PoolDrop> {
        const {token, totalAmount, numberOfParticipants,
            participationAmountFormatted, completedMessage, completedLink,restrictedParticipants } = req.data;
        validateFieldsRequired({token, totalAmount, numberOfParticipants,
            participationAmountFormatted});
        ValidationUtils.isTrue(Big(totalAmount).gt(Big(0)), "Amount must be greater than zero");
        ValidationUtils.isTrue(numberOfParticipants > 0, 'Number of participants must be greater than zero')
        const participationAmount = Big(totalAmount).div(numberOfParticipants).toString();
        const link = {
            version: 0,
            creatorId: '',
            creatorAddress: '',
            createdAt: 0,
            displayName: '',
            id: '',
            network: '' as any,
            currency: '',
            symbol: '',
            totalAmount,
            numberOfParticipants,
            participationAmount,
            participationAmountFormatted,
            claims: [],
            cancelled: false,
            executed: false,
            completedLink,
            completedMessage,
            transactionIds: [],
            restrictedParticipants
        } as PoolDrop;
        return this.userSvc.createLinkAndRegister(token, link);
    }

    async signAndSendAsync(userId: string, req: JsonRpcRequest): Promise<{requestId: string}> {
        const {linkId, token} = req.data;
        ValidationUtils.isTrue(!!linkId, '"linkId" must be provided');
        ValidationUtils.isTrue(!!token, '"token" must be provided');
        const requestId = await this.userSvc.signAndSendAsync(userId, linkId, token);
        return {requestId};
    }
}

function validateFieldsRequired(obj: any) {
    for(const k in obj) {
        if (!obj[k]) {
            ValidationUtils.isTrue(false, `"${k}" must be provided`);
        }
    }
}