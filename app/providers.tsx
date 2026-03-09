"use client";

import React from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base, zora } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { MockConnector } from "wagmi/connectors/mock";
import { createWalletClient, http } from "viem";
import { config } from "@/app/config";

declare global {
  interface Window {
    __TEST_WALLET__?: { address: string };
  }
}

const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum, base, zora],
  [publicProvider()]
);

function getWagmiConfig() {
  if (typeof window !== "undefined" && window.__TEST_WALLET__) {
    const testAddress = window.__TEST_WALLET__.address as `0x${string}`;
    const mockWalletClient = createWalletClient({
      account: testAddress,
      chain: mainnet,
      transport: http(),
    });

    const mockConnector = new MockConnector({
      chains,
      options: {
        walletClient: mockWalletClient,
        flags: { isAuthorized: true },
      },
    });

    return createConfig({
      autoConnect: true,
      connectors: [mockConnector],
      publicClient,
    });
  }

  const { connectors } = getDefaultWallets({
    appName: config.WALLET_CONNECT_PROJECT_NAME,
    projectId: config.WALLET_CONNECT_PROJECT_ID,
    chains,
  });

  return createConfig({
    autoConnect: true,
    connectors,
    publicClient,
  });
}

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false);
  const [wagmiConfig] = React.useState(() => getWagmiConfig());
  React.useEffect(() => setMounted(true), []);
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} appInfo={{ appName: "HODL Drive" }}>
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
