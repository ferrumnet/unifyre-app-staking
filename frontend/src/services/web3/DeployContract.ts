import Web3 from "web3";

export async function deployContrat(web3: Web3,
        abi: any,
        bytecode: string,
        constructorArgs: any[]): Promise<string> {
    const accounts = await web3.eth.getAccounts();
    const [ac1] = accounts;
    const owner = ac1;
  
    try {
      console.log('CONSTRUCTOR ARGS', constructorArgs);
      const festaking = await new web3.eth.Contract(abi)
        .deploy({ data: `0x${bytecode}`, arguments: constructorArgs});

        const gas = await festaking.estimateGas();
        const contract = await festaking.send({ from: owner, gas }) as any;
  
        if (contract._address) {
            alert(`Contract deployed with address: ${contract._address}`);
        }
        return contract._address;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  