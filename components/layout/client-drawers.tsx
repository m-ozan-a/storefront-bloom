"use client";

import dynamic from "next/dynamic";

const CartDrawer = dynamic(
  () => import("@/components/cart").then((mod) => ({ default: mod.CartDrawer })),
  { ssr: false }
);

const WishlistDrawer = dynamic(
  () => import("@/components/cart").then((mod) => ({ default: mod.WishlistDrawer })),
  { ssr: false }
);

const AuthPromptDialog = dynamic(
  () => import("@/components/auth-prompt-dialog").then((mod) => ({ default: mod.AuthPromptDialog })),
  { ssr: false }
);

export function ClientDrawers() {
  return (
    <>
      <CartDrawer />
      <WishlistDrawer />
      <AuthPromptDialog />
    </>
  );
}
