"use client";

import { PageRenderer } from "@json-render/next";
import type { Spec } from "@json-render/core";

interface PreviewRendererProps {
  spec: Spec;
  initialState?: Record<string, unknown>;
}

export function PreviewRenderer({ spec, initialState }: PreviewRendererProps) {
  return <PageRenderer spec={spec} initialState={initialState} />;
}
