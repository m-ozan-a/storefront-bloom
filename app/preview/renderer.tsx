"use client";

import { NextAppProvider, PageRenderer } from "@json-render/next";
import { registry } from "@/lib/json-render/components";
import type { Spec } from "@json-render/core";

interface PreviewRendererProps {
  spec: Spec;
  initialState?: Record<string, unknown>;
}

export function PreviewRenderer({ spec, initialState }: PreviewRendererProps) {
  return (
    <NextAppProvider registry={registry}>
      <PageRenderer spec={spec} initialState={initialState} />
    </NextAppProvider>
  );
}
