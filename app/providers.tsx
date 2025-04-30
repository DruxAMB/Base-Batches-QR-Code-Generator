"use client";

import { type ReactNode } from "react";
import { base } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { ThemeProvider } from "next-themes";
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi-config';

// Using WagmiProvider with Farcaster frame connector for proper Warpcast integration

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <MiniKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={base}
        config={{
          appearance: {
            mode: "auto",
            theme: "mini-app-theme",
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Instant QR",
            logo: process.env.NEXT_PUBLIC_ICON_URL,
          }
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {props.children}
        </ThemeProvider>
      </MiniKitProvider>
    </WagmiProvider>
  );
}
