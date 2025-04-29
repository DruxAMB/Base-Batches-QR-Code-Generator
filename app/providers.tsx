"use client";

import { type ReactNode } from "react";
import { base } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { ThemeProvider } from "next-themes";

// Note: We're using the existing MiniKitProvider from @coinbase/onchainkit/minikit
// which already includes the necessary wagmi configuration.
// Our custom usePremiumNFT hook will work with this provider.

export function Providers(props: { children: ReactNode }) {
  return (
    <MiniKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          mode: "auto",
          theme: "mini-app-theme",
          name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Instant QR",
          logo: process.env.NEXT_PUBLIC_ICON_URL,
        },
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
  );
}
