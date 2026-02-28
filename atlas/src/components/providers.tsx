"use client";

import { SWRConfig } from "swr";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateIfStale: true,
        dedupingInterval: 5000,
        errorRetryCount: 2,
        errorRetryInterval: 3000,
        fetcher: async (url: string) => {
          const res = await fetch(url);
          if (!res.ok) {
            const error = new Error("An error occurred while fetching data.");
            throw error;
          }
          return res.json();
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
