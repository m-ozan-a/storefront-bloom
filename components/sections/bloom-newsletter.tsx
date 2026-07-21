"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { subscribeToNewsletter } from "@/actions";

export function BloomNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    try {
      await subscribeToNewsletter(email);
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="pt-16 md:pt-20 pb-16 md:pb-20 bg-foreground">
      <div className="content-container">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-serif)] font-semibold text-background mb-4 tracking-tight">
            Join Our Community
          </h2>
          <p className="text-background/70 mb-8">
            Subscribe to receive updates on new arrivals, special offers, and movement inspiration.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={status === "loading" || status === "success"}
              className="flex-1 px-6 py-4 bg-foreground border border-border text-background placeholder:text-muted-foreground focus:outline-none focus:border-background/50 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="inline-flex items-center justify-center gap-2 bg-background text-foreground px-8 py-4 hover:bg-muted transition-colors uppercase text-xs font-semibold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {status === "loading" && "Subscribing..."}
              {status === "success" && "Subscribed!"}
              {status === "idle" && (
                <>
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
              {status === "error" && "Try Again"}
            </button>
          </form>

          {status === "success" && (
            <p className="mt-4 text-sm text-background/60">
              Thank you for subscribing!
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
