import WalletConnectProvider from "@walletconnect/web3-provider";

export function enableWalletConnect(infuraId: string = "498f412c002d42d8ba75293910cae6f8") {
    //  Create WalletConnect Provider
    const provider = new WalletConnectProvider({
        infuraId,
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
    // await this.addEvents(provider,dispatch);
    return provider;
}

