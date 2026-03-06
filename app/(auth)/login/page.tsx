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
import { ShieldCheck, LogIn, AlertCircle } from "lucide-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({ 
    resolver: zodResolver(schema),
    mode: "onSubmit"
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Unable to login");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md space-y-6 border-border/70 bg-white p-6 shadow-lg sm:p-8">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your wallet and verifications
          </p>
        </div>
      </div>

      {/* Form */}
      <form 
        className="space-y-4" 
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit(onSubmit)(e);
        }}
        method="POST"
        action="#"
        autoComplete="off"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <Input 
            type="email"
            placeholder="you@example.com" 
            {...form.register("email")}
            className="h-11"
          />
          {form.formState.errors.email && (
            <p className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input 
            type="password" 
            placeholder="Enter your password"
            {...form.register("password")}
            className="h-11"
          />
          {form.formState.errors.password && (
            <p className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-900">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <Button 
          type="submit" 
          size="lg" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? (
            "Signing in..."
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign In
            </>
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="space-y-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-muted-foreground">
              New to JAMB Verify?
            </span>
          </div>
        </div>
        
        <Button variant="outline" size="lg" className="w-full" asChild>
          <Link href="/register">
            Create Account
          </Link>
        </Button>
      </div>
    </Card>
  );
}
