"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const schema = z.object({
  fullName: z.string().min(3, "Enter your full name"),
  email: z.string().email(),
  phone: z.string().min(8, "Enter a phone number"),
  password: z.string().min(6, "Minimum 6 characters")
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Unable to register");
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg space-y-6 border-border/70 bg-white/90 p-8 shadow-card">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
          Get started
        </p>
        <h1 className="font-heading text-3xl font-semibold">Create your JAMB Verify account</h1>
        <p className="text-sm text-muted-foreground">
          Fund your wallet and verify NINs instantly.
        </p>
      </div>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full name</label>
            <Input placeholder="Aisha Yusuf" {...form.register("fullName")} />
            {form.formState.errors.fullName ? (
              <p className="text-xs text-red-500">
                {form.formState.errors.fullName.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone number</label>
            <Input placeholder="08012345678" {...form.register("phone")} />
            {form.formState.errors.phone ? (
              <p className="text-xs text-red-500">
                {form.formState.errors.phone.message}
              </p>
            ) : null}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input placeholder="you@example.com" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input type="password" {...form.register("password")} />
          {form.formState.errors.password ? (
            <p className="text-xs text-red-500">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
