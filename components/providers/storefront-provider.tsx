"use client";

import { NextAppProvider } from "@json-render/next";
import { registry } from "@/lib/json-render/components";
import type { ReactNode } from "react";

export function StorefrontProvider({ children }: { children: ReactNode }) {
  return (
    <NextAppProvider registry={registry}>
      {children}
    </NextAppProvider>
  );
}
