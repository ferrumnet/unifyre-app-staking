import {LambdaHttpRequest, LambdaHttpResponse, UnifyreBackendProxyService} from "aws-lambda-helper";
import {LambdaHttpHandler} from "aws-lambda-helper/dist/HandlerFactory";
import {
    JsonRpcRequest,
    ValidationUtils
} from "ferrum-plumbing";
import { StakingAppService } from "./StakingAppService";
import { StakeEvent } from "./Types";

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
        private adminSecret: string) {
    }

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
                    body = await this.adminSaveStakingContactInfo(req);
                    break;
                case 'getStakingsForToken':
                    body = await this.getStakingsForToken(req);
                    break;
                case 'getStakingContractForUser':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.getStakingContractForUser(userId!, req);
                    break;
                case 'getAllStakingEventsForUser':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.getStakingEventsForUser(userId!, req);
                    break;
                case 'stakeTokenSignAndSend':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.stakeTokenSignAndSend(req);
                    break;
                case 'updateStakingEvents':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.updateStakingEvents(req);
                case 'unstakeTokenSignAndSend':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.unstakeTokenSignAndSend(req);
                    break;
                // TODO: Implement
                // case 'saveTransaction':
                //     ValidationUtils.isTrue(!!userId, 'user must be signed in');
                //     body = await this.saveUserStakingData(req.data.token);
                //     //todo: update user data after staking         
                //     break;
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

    async adminSaveStakingContactInfo(req: JsonRpcRequest) {
        const {network, contractAddress, color, logo, adminSecret} = req.data;
        ValidationUtils.isTrue(adminSecret === this.adminSecret, 'Not authorized');
        ValidationUtils.isTrue(!!network, '"network" must be provided');
        ValidationUtils.isTrue(!!contractAddress, '"contractAddress" must be provided');
        return await this.userSvc.saveStakeInfo(network, contractAddress, color, logo)
    }

    async getStakingsForToken(req: JsonRpcRequest) {
        const {currency} = req.data;
        ValidationUtils.isTrue(!!currency, '"currency" must be provided');
        return await this.userSvc.getStakingsForToken(currency);
    }

    async getStakingContractForUser(userId: string, req: JsonRpcRequest) {
        const {network, contractAddress, userAddress} = req.data;
        ValidationUtils.isTrue(!!network, '"network" must be provided');
        ValidationUtils.isTrue(!!contractAddress, '"contractAddress" must be provided');
        ValidationUtils.isTrue(!!userAddress, '"userAddress" must be provided');
        return await this.userSvc.getStakingContractForUser(network, contractAddress, userAddress, userId);
    }

    async getStakingEventsForUser(userId: string, req: JsonRpcRequest) {
        return await this.userSvc.getUserStakingEvents(userId);
    }

    async stakeTokenSignAndSend(req: JsonRpcRequest): Promise<{requestId: string}> {
        const {amount, network, contractAddress, userAddress} = req.data;
        ValidationUtils.isTrue(!!amount, '"amount" must be provided');
        ValidationUtils.isTrue(!!network, '"network" must be provided');
        ValidationUtils.isTrue(!!contractAddress, '"contractAddress" must be provided');
        ValidationUtils.isTrue(!!userAddress, '"userAddress" must be provided');
        const requestId = await this.userSvc.stakeTokenSignAndSend(network, contractAddress, userAddress, amount);
        return {requestId};
    }

    async updateStakingEvents(req: JsonRpcRequest): Promise<StakeEvent[]> {
        const {txIds} = req.data;
        ValidationUtils.isTrue(!!txIds, '"txIds" must be provided');
        return await this.userSvc.updateStakingEvents(txIds);
    }

    async unstakeTokenSignAndSend(req: JsonRpcRequest): Promise<{requestId: string}> {
        const {amount, network, contractAddress, userAddress} = req.data;
        ValidationUtils.isTrue(!!amount, '"amount" must be provided');
        ValidationUtils.isTrue(!!network, '"network" must be provided');
        ValidationUtils.isTrue(!!contractAddress, '"contractAddress" must be provided');
        ValidationUtils.isTrue(!!userAddress, '"userAddress" must be provided');
        const requestId = await this.userSvc.unstakeTokenSignAndSend(network, contractAddress, userAddress, amount);
        return {requestId};
    }
}
