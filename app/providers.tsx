"use client";

import React from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, createConfig, http, useConnect, useAccount } from "wagmi";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
} from "wagmi/chains";
import { mock } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config as appConfig } from "@/app/config";

declare global {
  interface Window {
    __TEST_WALLET__?: { address: string };
  }
}

const queryClient = new QueryClient();

const chains = [mainnet, polygon, optimism, arbitrum, base, zora] as const;

const transports = {
  [mainnet.id]: http(),
  [polygon.id]: http(),
  [optimism.id]: http(),
  [arbitrum.id]: http(),
  [base.id]: http(),
  [zora.id]: http(),
};

function getWagmiConfig() {
  if (typeof window !== "undefined" && window.__TEST_WALLET__) {
    const testAddress = window.__TEST_WALLET__.address as `0x${string}`;

    return createConfig({
      chains,
      transports,
      connectors: [
        mock({
          accounts: [testAddress],
        }),
      ],
    });
  }

  return getDefaultConfig({
    appName: appConfig.WALLET_CONNECT_PROJECT_NAME || "HODL Drive",
    projectId: appConfig.WALLET_CONNECT_PROJECT_ID || "test-project-id",
    chains,
    transports,
  });
}

function AutoConnectMock({ children }: { children: React.ReactNode }) {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();

  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.__TEST_WALLET__ &&
      !isConnected &&
      connectors.length > 0
    ) {
      connect({ connector: connectors[0] });
    }
  }, [connect, connectors, isConnected]);

  return <>{children}</>;
}

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false);
  const [wagmiConfig] = React.useState(() => getWagmiConfig());
  React.useEffect(() => setMounted(true), []);
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AutoConnectMock>
            {mounted && children}
          </AutoConnectMock>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
