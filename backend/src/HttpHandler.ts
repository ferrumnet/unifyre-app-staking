import {LambdaHttpRequest, LambdaHttpResponse, UnifyreBackendProxyService} from "aws-lambda-helper";
import {LambdaHttpHandler} from "aws-lambda-helper/dist/HandlerFactory";
import {
    JsonRpcRequest,
    ValidationUtils
} from "ferrum-plumbing";
import { StakingAppService } from "./StakingAppService";
import { StakingApp } from "./Types";
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
        private userSvc: StakingAppService,
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
                case 'signInToServer':
                    let {token} = req.data;
                    const [userProfile, session] = await this.uniBack.signInToServer(token);
                    let currency = ((userProfile.accountGroups[0] || []).addresses[0] || {}).currency;
                    ValidationUtils.isTrue(!!currency, 'signed in user has no active wallet');
                    console.log(userProfile);
                    //await this.userSvc.saveStakeInfo(req.data.token, currency)
                    body = {userProfile, session};
                    break;
                case 'getTokenStakingInfo':
                    body = await this.userSvc.get(req.data.symbol)
                    break;
                case 'stakeTokenSignAndSend':
                    const {amount} = req.data;   
                    body = await this.signAndSendAsync(amount,req.data.token);          
                    //body = await this.userSvc.createStake({amount,userAddress,uniToken:token,currency})
                    break;
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

    async transactionsReceived(req: JsonRpcRequest): Promise<any> {
        const {linkId, transactionIds} = req.data;
        validateFieldsRequired({linkId, transactionIds});
        //return this.userSvc.addTransactionIds(linkId, transactionIds);
    }

    async getLink(req: JsonRpcRequest): Promise<any> {
        const {linkId} = req.data;
        validateFieldsRequired({linkId});
        const pd = ''
        ValidationUtils.isTrue(!!pd, "Link not found");
        return pd!;
    }

    async claim(req: JsonRpcRequest): Promise<any> {
        const {token, linkId} = req.data;
        validateFieldsRequired({token, linkId});
        //return this.userSvc.claim(token, linkId);
    }

    async cancelLink(userId: string, req: JsonRpcRequest): Promise<any> {
        const {linkId} = req.data;
        validateFieldsRequired({userId, linkId});
       // return this.userSvc.cancelLink(userId, linkId);
    }

    async signAndSendAsync(amount:number,uniToken:string): Promise<any> {
        ValidationUtils.isTrue(!!uniToken, '"token" must be provided');
        const [userProfile] = await this.uniBack.signInToServer(uniToken);
        let userAddress = ((userProfile.accountGroups[0] || []).addresses[0] || {}).address;
        let currency = ((userProfile.accountGroups[0] || []).addresses[0] || {}).currency;
        const requestId = this.userSvc.stakeToken({amount,userAddress,uniToken,currency})
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