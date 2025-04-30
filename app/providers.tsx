"use client";

import { type ReactNode } from "react";
import { base } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { ThemeProvider } from "next-themes";

// Using the standard MiniKit provider which works with Warpcast
// MiniKit already has built-in support for Warpcast

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
  );
}
