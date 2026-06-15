"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { subscribeToNewsletter } from "@/lib/owuan";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      await subscribeToNewsletter(email);
      setStatus("success");
      setMessage("Thank you for subscribing!");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading" || status === "success"}
        />
        <Button
          type="submit"
          disabled={status === "loading" || status === "success" || !email}
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Subscribe"
          )}
        </Button>
      </div>
      {status === "success" && (
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
          <Check className="h-4 w-4" />
          {message}
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {message}
        </p>
      )}
    </form>
  );
}
