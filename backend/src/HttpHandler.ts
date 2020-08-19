import {LambdaHttpRequest, LambdaHttpResponse, UnifyreBackendProxyService} from "aws-lambda-helper";
import {LambdaHttpHandler} from "aws-lambda-helper/dist/HandlerFactory";
import {
    JsonRpcRequest,
    ValidationUtils
} from "ferrum-plumbing";
import { StakingAppService } from "./StakingAppService";


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
                    body = {userProfile, session};
                    break;
                case 'adminSaveStakingContractInfo':
                    //admin save new contract
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    await this.saveStakingContactInfo(req.data.token)
                    body = {userProfile, session};
                    break;
                case 'getTokenStakingInfo':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.userSvc.get(req.data.symbol)
                    break;
                case 'stakeTokenSignAndSend':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.signAndSendAsync(req.data.amount,req.data.token);          
                    break;
                case 'saveTransaction':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.saveUserStakingData(req.data.token);
                    //todo: update user data after staking         
                    break;
                case 'unstakeTokenSignAndSend':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.unstakeSignAndSendAsync(req.data.amount,req.data.token);          
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


    async saveStakingContactInfo (uniToken:string) {
        ValidationUtils.isTrue(!!uniToken, '"token" must be provided');
        const [userProfile] = await this.uniBack.signInToServer(uniToken);
        let currency = ((userProfile.accountGroups[0] || []).addresses[0] || {}).currency;
        const response = await this.userSvc.saveStakeInfo(uniToken,currency)
        return response;
    }

    async signAndSendAsync(amount:number,uniToken:string): Promise<any> {
        ValidationUtils.isTrue(!!uniToken, '"token" must be provided');
        const [userProfile] = await this.uniBack.signInToServer(uniToken);
        let userAddress = ((userProfile.accountGroups[0] || []).addresses[0] || {}).address;
        let currency = ((userProfile.accountGroups[0] || []).addresses[0] || {}).currency;
        const requestId = this.userSvc.stakeToken({amount,userAddress,uniToken,currency})
        return {requestId};
    }

    async unstakeSignAndSendAsync(amount:number,uniToken:string): Promise<any> {
        ValidationUtils.isTrue(!!uniToken, '"token" must be provided');
        const [userProfile] = await this.uniBack.signInToServer(uniToken);
        let userAddress = ((userProfile.accountGroups[0] || []).addresses[0] || {}).address;
        let currency = ((userProfile.accountGroups[0] || []).addresses[0] || {}).currency;
        const requestId = this.userSvc.unstakeToken({amount,userAddress,uniToken,currency})
        return {requestId};
    }

    async saveUserStakingData (uniToken:string): Promise<any> {
        ValidationUtils.isTrue(!!uniToken, '"token" must be provided');
        const [userProfile] = await this.uniBack.signInToServer(uniToken);
        let userAddress = ((userProfile.accountGroups[0] || []).addresses[0] || {}).address;
        let currency = ((userProfile.accountGroups[0] || []).addresses[0] || {}).currency;
        let id = userProfile.accountGroups[0].id;
        const response = this.userSvc.saveUserStakingData(id,userAddress,currency)
        return response;
    }
}
