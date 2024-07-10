"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { ReactNode } from "react";

const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    // alchemyId: "GM0NI7rm9xRUUFpPs6bT5wKsM2YTaCuR", // testnet
    walletConnectProjectId: "5a2cb35e0ed7f091a5c2c9a5cf4ed988",

    // Required
    appName: "Sign up for Farcaster",
    chains: [optimism, mainnet],

    // Optional
    appDescription:
      "Simple app illustrating how to sign up for Farcaster. Educational purposes only.",
    appUrl: "https://www.farcaster.xyz/", // your app's url
    appIcon:
      "https://framerusercontent.com/modules/jVMp8b8ZfTZpbLnhDiml/NV8p4XHr9GEQFJDJsKKb/assets/DE2CvWySqIW7eDC8Ehs5bCK6g.svg", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Web3Provider;
