"use client";

import { JSONUIProvider, Renderer } from "@json-render/react";
import { registry } from "./components";
import type { Spec } from "@json-render/core";

interface StorefrontRendererProps {
  spec: Spec;
  state?: Record<string, unknown>;
}

export function StorefrontRenderer({ spec, state }: StorefrontRendererProps) {
  return (
    <JSONUIProvider registry={registry} initialState={state ?? {}}>
      <Renderer spec={spec} registry={registry} />
    </JSONUIProvider>
  );
}
