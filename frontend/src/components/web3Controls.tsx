import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { AnyAction, Dispatch } from 'redux';
import { addAction, CommonActions } from '../common/Actions';

export class WalletConnectControls {

    async enableWallet(dispatch:Dispatch<AnyAction>) {
        //  Create WalletConnect Provider
        const provider = new WalletConnectProvider({
            infuraId: "498f412c002d42d8ba75293910cae6f8",
            qrcodeModalOptions: {
                mobileLinks: [
                  "rainbow",
                  "metamask",
                  "argent",
                  "trust",
                  "imtoken",
                  "pillar"
                ]
              }
        });
        await this.addEvents(provider,dispatch);
        await provider.enable();
        const web3 = new Web3(provider as any);
        return {provider,web3}
    }

    async addEvents(provider:any,dispatch: Dispatch<AnyAction>){
        // Subscribe to accounts change
        provider.on("accountsChanged", (accounts: string[]) => {
            console.log(accounts);
        });
        
        // Subscribe to chainId change
        provider.on("chainChanged", (chainId: number) => {
            console.log(chainId);
        });
        
        // Subscribe to networkId change
        provider.on("networkChanged", (networkId: number) => {
            console.log(networkId);
        });
        
        // Subscribe to session connection/open
        provider.on("open", () => {
            console.log("open");
        });
        
        // Subscribe to session disconnection/close
        provider.on("close", (code: number, reason: string) => {
            console.log(code, reason);
        });

        provider.on("connect",()=>{
            console.log('connected');
            localStorage.setItem('WALLETCONNECT_PROVIDER', provider);
        })

        provider.on("disconnect",()=>{
            dispatch(addAction(CommonActions.DISCONNECT, {}))
        })
    }

    async web3Client(provider:any){
        const web3 = new Web3(provider as any);
        return web3
    }

    async WCAccounts(provider:any){
        const web3 = new Web3(provider as any);
        return await web3.eth.getAccounts();
    }

    async WCNetworkId(provider:any){
        const web3 = new Web3(provider as any);
        const networkId = await web3.eth.net.getId();
        return networkId
    }
}
