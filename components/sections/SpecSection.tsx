import { PageRenderer } from "@json-render/next";
import type { Spec } from "@json-render/core";
import { isFlatSpec, buildSpecState } from "@/lib/json-render/build-spec-state";

export async function SpecSection({ spec }: { spec: unknown }) {
  if (!spec || !isFlatSpec(spec)) return null;
  const initialState = await buildSpecState(spec);
  return <PageRenderer spec={spec as unknown as Spec} initialState={initialState} />;
}
