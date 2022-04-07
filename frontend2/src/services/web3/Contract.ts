import { Injectable, LocalCache, ValidationUtils } from 'ferrum-plumbing';
import Web3 from 'web3';
import { StakingApp } from '../../common/Types';
import { logError } from '../../common/Utils';
import FerrumJson from './resources/abi/FerrumToken.json'
import FestakingJson from './resources/abi/Festaking-abi.json';
import FestakingBytecode from './resources/abi/Festaking-bytecode.json';
import { Big } from 'big.js';

export class ContractCallError extends Error {
    constructor(msg: string, public error: any) {
      super(msg);
    }
}

class ContractBase {
    constructor(protected web3: Web3) {
    }
  
    sendTransactionParams(sender: string, gas: string) {
      return {
        from: sender, gas
      };
    }
  
    async contractExist(contractAddress: string) {
      const code = await this.web3.eth.getCode(contractAddress);
      return code.length > 4;
    }
  
    /**
       * Calls a contract, receives transaction ID.
       * * fun should return a method transactions
       */
    async callContractWrapper(topic: string, sender: string,
        fun: () => any) {
      try {
        const method = fun();
        const gas = await method.estimateGas();
        const txId = await (new Promise((resolve, reject) => {
          method.send(this.sendTransactionParams(sender, gas))
            .on('transactionHash', (tid: string) => resolve(tid))
            .catch((e: Error) => reject(e));
        }));
        if (!txId) {
          throw new ContractCallError(`Calling contract for '${topic}' returned no transaction ID`, undefined);
        }
        return txId;
      } catch (e) {
        if (e instanceof ContractCallError) {
          throw e;

        }
        //@ts-ignore
        logError(`Error calling contract method: ${topic}`, e);
        throw new ContractCallError(`Error calling contract method: ${topic}`, e);
      }
    }
  }

export class TokenContractFactory implements Injectable {
    private cache: LocalCache;
    constructor(private web3: Web3) {
        this.cache = new LocalCache();
     }
    __name__() { return 'TokenContractFactory'; }

    async forToken(token: string) {
        ValidationUtils.isTrue(!!token, '"token" must be provided');
        return this.cache.getAsync(token, async () => {
            const con = new TokenContract(this.web3);
            await con.init(token);
            return con;
        });
    }
}

export class TokenContract extends ContractBase {
    private contract: any;
    private name?: string;
    private symbol?: string;
    private decimals?: number;
    constructor(web3: Web3) {
      super(web3);
      this.rawToAmount = this.rawToAmount.bind(this);
      this.amountToRaw = this.amountToRaw.bind(this);
    }

    async init(tokenAddress: string) {
      if (!await this.contractExist(tokenAddress)) {
        throw new ContractCallError(`Token contract '${tokenAddress}' not found. Make sure metamask is connected to the right network`, null);
      }
      this.contract = await new this.web3.eth.Contract(FerrumJson.abi as any, tokenAddress);
      this.name = await this.contract.methods.name.call().call();
      this.symbol = await this.contract.methods.symbol.call().call();
      this.decimals = await this.contract.methods.decimals.call().call();
   } 
  
    async balanceOf(address: string) {
      return this.rawToAmount(await this.contract.methods.balanceOf(address).call());
    }
  
    async allowance(userAddress: string, contractAddress: string) {
      return this.rawToAmount(await this.contract.methods.allowance(userAddress, contractAddress).call());
    }

    getName() { return this.name; }

    getSymbol() { return this.symbol; }
  
    amountToRaw(amount: string) {
      return new Big(amount).mul(10 ** this.decimals!).toFixed();
    }
  
    rawToAmount(raw: string) {
      return new Big(raw).div(10 ** this.decimals!).toFixed();
    }
  
    async approve(userAddress: string, target: string, amount: string) {
      const rawAmount = this.amountToRaw(amount);
      return this.callContractWrapper('APPROVE',
        userAddress,
        () => this.contract.methods.approve(target, rawAmount));
    }
  }

  export class FestakingContract extends ContractBase {
    private tokenContract?: string;
    private festaking: any;
    constructor(web3: Web3, private tokenFactory: TokenContractFactory) {
      super(web3);
      this.addReward = this.addReward.bind(this);
    }
  
    async init(contractAddress: string, tokenContract: string) {
      this.tokenContract = tokenContract;
      if (!await this.contractExist(contractAddress)) {
        throw new ContractCallError(`Staking contract '${contractAddress}' not found. Make sure metamask in connected to the right network`, null);
      }
      this.festaking = await new this.web3.eth.Contract(FestakingJson as any, contractAddress);
    }
  
    async addReward(userAddress: string, rewardAmount: string, withdrawableAmount: string) {
      const token = await this.tokenFactory.forToken(this.tokenContract!);
      const rawRewardAmount = token.amountToRaw(rewardAmount);
      const rawWithdrawableAmount = token.amountToRaw(withdrawableAmount);
      await this.callContractWrapper(
        'ADD_REWARD',
        userAddress,
        () => this.festaking.methods.addReward(rawRewardAmount, rawWithdrawableAmount),
      );
    }
  }

export class DeployService implements Injectable {
    constructor(private toknFac: TokenContractFactory, private web3: Web3) {
    }

    __name__() { return 'DeployService'; }

    async deploy(staking: StakingApp) {
        ValidationUtils.isTrue(!!staking.tokenAddress, '"tokenAddress" must be provided')
        const tok = await this.toknFac.forToken(staking.tokenAddress);
        const constructorArgs = [
            name,
            staking.tokenAddress,
            staking.stakingStarts,
            staking.stakingEnds,
            staking.withdrawStarts,
            staking.withdrawEnds,
            tok.amountToRaw(staking.stakingCap),
          ];
        // return await deployContrat(
        //     this.web3, FestakingJson, FestakingBytecode.object, constructorArgs);
    }
}
