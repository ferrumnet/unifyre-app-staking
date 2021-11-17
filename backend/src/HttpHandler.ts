import {LambdaHttpRequest, LambdaHttpResponse, UnifyreBackendProxyService} from "aws-lambda-helper";
import { Web3ProviderConfig } from "aws-lambda-helper/dist/blockchain";
import {LambdaHttpHandler} from "aws-lambda-helper/dist/HandlerFactory";
import {
    JsonRpcRequest,
    ValidationUtils
} from "ferrum-plumbing";
import { CustomTransactionCallRequest } from "unifyre-extension-sdk";
import { StakingAppService } from "./StakingAppService";
import { StakeEvent } from "./Types";
import Web3 from "web3";
import { TokenBridgeHttpHandler } from "./tokenBridge/TokenBridgeHttpHandler";

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
    private adminHash: string;
    constructor(private uniBack: UnifyreBackendProxyService,
        private userSvc: StakingAppService,
        private adminSecret: string,
        private authRandomKey: string,
        private networkConfig: Web3ProviderConfig,
        private tokenBridge: TokenBridgeHttpHandler,
        ) {
        this.adminHash = Web3.utils.sha3('__ADMIN__' + this.adminSecret)!;
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
                case 'signInUsingAddress':
                    let {userAddress} = req.data;
                    const unsecureSession = await this.uniBack.newSession(userAddress);
                    body = {unsecureSession};
                    break;
                case 'signInToServer':
                    let {token} = req.data;
                    const [userProfile, session] = await this.uniBack.signInToServer(token);
                    let currency = ((userProfile.accountGroups[0] || []).addresses[0] || {}).currency;
                    ValidationUtils.isTrue(!!currency, 'signed in user has no active wallet');
                    console.log(userProfile);
                    body = {userProfile, session};
                    break;
                case 'signInAdmin':
                    let {secret} = req.data;
                    const resp = await this.signInAdmin(secret);
                    body = {session: resp}
                    break;
                case 'checkAdminToken':
                    let {savedSession} = req.data;
                    const uid = await this.uniBack.signInUsingToken(savedSession);
                    ValidationUtils.isTrue(uid === this.adminHash, 'Bad admin hash');
                    body = {session: savedSession}
                    break;
                case 'adminSaveStakingContractInfo':
                    ValidationUtils.isTrue(userId === this.adminHash, 'Bad admin hash');
                    //admin save new contract
                    body = await this.adminSaveStakingContactInfo(req);
                    break;
                case 'adminUpdateStakingContractInfo':
                    ValidationUtils.isTrue(userId === this.adminHash, 'Bad admin hash');
                    //admin save new contract
                    body = await this.adminUpdateStakingContactInfo(req);
                    break;
                case 'adminDeleteStakingContractInfo':
                    ValidationUtils.isTrue(userId === this.adminHash, 'Bad admin hash');
                    //admin save new contract
                    body = await this.adminDeleteStakingContactInfo(req);
                    break;
                case 'getStakingsForToken':
                    body = await this.getStakingsForToken(req);
                    break;
                case 'getStakingByContractAddress':
                    body = await this.getStakingsByContractAddress(req);
                    break;
                case 'getStakingContractForUser':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.getStakingContractForUser(userId!, req);
                    break;
                case 'getAllStakingEventsForUser':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.getStakingEventsForUser(userId!, req);
                    break;
                case 'getHttpProviders':
                    body = this.networkConfig;
                    break;
                case 'getGroupInfo':
                    const {groupId} = req.data;
                    body = await this.userSvc.getGroupInfo(groupId);
                    break;
                case 'addGroupInfo':
                    ValidationUtils.isTrue(userId === this.adminHash, 'Bad admin hash');
                    body = await this.userSvc.addGroupInfo(req.data.info);
                    break;
                case 'updateGroupInfo':
                    ValidationUtils.isTrue(userId === this.adminHash, 'Bad admin hash');
                    body = await this.userSvc.updateGroupInfo(req.data.info);
                    break;
                case 'getAllGroupInfos':
                    body = await this.userSvc.getAllGroupInfo();
                    break;
                case 'stakeEventProcessTransactions':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.stakeEventProcessTransactions(userId!, req);
                    break;
                case 'stakeTokenSignAndSendGetTransaction':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.stakeTokenSignAndSendGetTransaction(req);
                    break;
                case 'stakeTokenSignAndSend':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.stakeTokenSignAndSend(req);
                    break;
                case 'updateStakingEvents':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.updateStakingEvents(req);
                    break;
                case 'unstakeTokenSignAndSendGetTransaction':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.unstakeTokenSignAndSendGetTransaction(req);
                    break;
                case 'unstakeTokenSignAndSend':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.unstakeTokenSignAndSend(req);
                    break;
                case 'takeRewardsSignAndSendGetTransaction':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.takeRewardsSignAndSendGetTransaction(req);
                    break;
                case 'takeRewardsSignAndSend':
                    ValidationUtils.isTrue(!!userId, 'user must be signed in');
                    body = await this.takeRewardsSignAndSend(req);
                    break;
                // TODO: Implement
                // case 'saveTransaction':
                //     ValidationUtils.isTrue(!!userId, 'user must be signed in');
                //     body = await this.saveUserStakingData(req.data.token);
                //     //todo: update user data after staking         
                //     break;
                default:
                    body = await this.tokenBridge.handle(req, userId);
                    if (!body) {
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
                    break;
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
                body: JSON.stringify({error: (e as Error).toString()}),
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
        const {network,
            contractType,
            contractAddress,
            color,
            logo, backgroundImage, groupId, minContribution,
            maxContribution, emailWhitelist,
            earlyWithdrawRewardSentence, totalRewardSentence,
            adminSecret} = req.data;
        ValidationUtils.isTrue(!!network, '"network" must be provided');
        ValidationUtils.isTrue(!!contractAddress, '"contractAddress" must be provided');
        ValidationUtils.isTrue(!!contractType, '"contractType" must be provided');
        ValidationUtils.isTrue(['staking', 'stakeFarming'].indexOf(contractType) >= 0, '"contractType" must be provided');
        return await this.userSvc.saveStakeInfo(
            network, contractType, (contractAddress || '').toLowerCase(), groupId, color, logo,
            backgroundImage, minContribution, maxContribution, emailWhitelist,
            earlyWithdrawRewardSentence, totalRewardSentence,
            );
    }

    async adminUpdateStakingContactInfo(req: JsonRpcRequest) {
        const {network,
            contractType,
            contractAddress} = req.data;
        ValidationUtils.isTrue(!!network, '"network" must be provided');
        ValidationUtils.isTrue(!!contractAddress, '"contractAddress" must be provided');
        ValidationUtils.isTrue(!!contractType, '"contractType" must be provided');
        ValidationUtils.isTrue(['staking', 'stakeFarming'].indexOf(contractType) >= 0, '"contractType" must be provided');
        return await this.userSvc.updateStakeInfo(req.data as any);
    }

    async adminDeleteStakingContactInfo(req: JsonRpcRequest) {
        const {network,
            contractAddress} = req.data;
        ValidationUtils.isTrue(!!network, '"network" must be provided');
        ValidationUtils.isTrue(!!contractAddress, '"contractAddress" must be provided');
        return await this.userSvc.adminDeleteStakingInfo(network, contractAddress);
    }

    async getStakingsByContractAddress(req: JsonRpcRequest) {
        const {network, contractAddress} = req.data;
        ValidationUtils.isTrue(!!contractAddress, '"contractAddress" must be provided');
        return await this.userSvc.getStakingByContractAddress(network, contractAddress);
    }

    signInAdmin(secret?: string): undefined | string {
        if(secret === this.adminSecret){
            return this.uniBack.newSession(this.adminHash);
        }
        return
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
        const {currency} = req.data;
        ValidationUtils.isTrue(!!currency, '"currency" must be provided');
        return await this.userSvc.getUserStakingEvents(userId, currency);
    }

    async stakeTokenSignAndSendGetTransaction(req: JsonRpcRequest):
    Promise<CustomTransactionCallRequest[]> {
        const {amount, network, contractAddress, userAddress} = req.data;
        ValidationUtils.isTrue(!!amount, '"amount" must be provided');
        ValidationUtils.isTrue(!!network, '"network" must be provided');
        ValidationUtils.isTrue(!!contractAddress, '"contractAddress" must be provided');
        ValidationUtils.isTrue(!!userAddress, '"userAddress" must be provided');
        return await this.userSvc.stakeTokenSignAndSendGetTransactions(
            userAddress, '', network, contractAddress, userAddress, amount);
    }

    async stakeTokenSignAndSend(req: JsonRpcRequest): Promise<{requestId: string, stakeEvent?: StakeEvent}> {
        const {token, amount, network, contractAddress, userAddress} = req.data;
        ValidationUtils.isTrue(!!token, '"token" must be provided');
        ValidationUtils.isTrue(!!amount, '"amount" must be provided');
        ValidationUtils.isTrue(!!network, '"network" must be provided');
        ValidationUtils.isTrue(!!contractAddress, '"contractAddress" must be provided');
        ValidationUtils.isTrue(!!userAddress, '"userAddress" must be provided');
        const {requestId, stakeEvent} = await this.userSvc.stakeTokenSignAndSend(token, network, contractAddress, userAddress, amount);
        return {requestId, stakeEvent};
    }

    async stakeEventProcessTransactions(userId: string, req: JsonRpcRequest): Promise<{stakeEvent: StakeEvent}> {
        const {token, amount, eventType, network, contractAddress, txIds} = req.data;
        ValidationUtils.isTrue(!!amount, '"amount" must be provided');
        ValidationUtils.isTrue(!!eventType, '"eventType" must be provided');
        ValidationUtils.isTrue(!!contractAddress, '"contractAddress" must be provided');
        ValidationUtils.isTrue(!!txIds, '"txIds" must be provided');
        const stakeEvent = await this.userSvc.stakeEventProcessTransactions(
            userId, token, eventType, network, contractAddress,
            amount, txIds);
        //@ts-ignore
        return {stakeEvent};
    }

    async updateStakingEvents(req: JsonRpcRequest): Promise<StakeEvent[]> {
        const {txIds} = req.data;
        ValidationUtils.isTrue(!!txIds, '"txIds" must be provided');
        return await this.userSvc.updateStakingEvents(txIds);
    }

    async unstakeTokenSignAndSendGetTransaction(req: JsonRpcRequest):
    Promise<CustomTransactionCallRequest[]> {
        const {amount, network, contractAddress, userAddress} = req.data;
        ValidationUtils.isTrue(!!amount, '"amount" must be provided');
        ValidationUtils.isTrue(!!network, '"network" must be provided');
        ValidationUtils.isTrue(!!contractAddress, '"contractAddress" must be provided');
        ValidationUtils.isTrue(!!userAddress, '"userAddress" must be provided');
        return await this.userSvc.unstakeTokenSignAndSendGetTransaction(
            network, contractAddress, userAddress, amount);
    }

    async unstakeTokenSignAndSend(req: JsonRpcRequest): Promise<{requestId: string}> {
        const {token, amount, network, contractAddress, userAddress} = req.data;
        ValidationUtils.isTrue(!!token, '"token" must be provided');
        ValidationUtils.isTrue(!!amount, '"amount" must be provided');
        ValidationUtils.isTrue(!!network, '"network" must be provided');
        ValidationUtils.isTrue(!!contractAddress, '"contractAddress" must be provided');
        ValidationUtils.isTrue(!!userAddress, '"userAddress" must be provided');
        return await this.userSvc.unstakeTokenSignAndSend(token, network, contractAddress, userAddress, amount);
    }

    async takeRewardsSignAndSend(req: JsonRpcRequest): Promise<{requestId: string}> {
        const {token, network, contractAddress, userAddress} = req.data;
        ValidationUtils.isTrue(!!token, '"token" must be provided');
        ValidationUtils.isTrue(!!network, '"network" must be provided');
        ValidationUtils.isTrue(!!contractAddress, '"contractAddress" must be provided');
        ValidationUtils.isTrue(!!userAddress, '"userAddress" must be provided');
        return await this.userSvc.takeRewardsSignAndSend(token, network, contractAddress, userAddress);
    }

    async takeRewardsSignAndSendGetTransaction(req: JsonRpcRequest):
    Promise<CustomTransactionCallRequest[]> {
        const {amount, network, contractAddress, userAddress} = req.data;
        ValidationUtils.isTrue(!!network, '"network" must be provided');
        ValidationUtils.isTrue(!!contractAddress, '"contractAddress" must be provided');
        ValidationUtils.isTrue(!!userAddress, '"userAddress" must be provided');
        return await this.userSvc.takeRewardsSignAndSendGetTransaction(
            network, contractAddress, userAddress);
    }
}
