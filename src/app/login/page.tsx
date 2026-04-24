"use client";

import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth-provider";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    signup,
    user,
    loading,
    configured,
    authError,
    clearAuthError,
  } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayedError = error ?? authError;

  useEffect(() => {
    if (user && !loading) {
      router.replace(user.role === "admin" ? "/admin" : "/team");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    clearAuthError();
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password, name.trim() || undefined);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message.replace("Firebase: ", ""));
    } finally {
      setSubmitting(false);
    }
  };

  if (!configured) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-lg rounded-xl border border-blush-300 bg-blush-50 p-6 text-sm text-navy-800">
          <h2 className="mb-2 text-lg font-semibold">Firebase not configured</h2>
          <p className="mb-2">
            Set the <code className="rounded bg-stone-200 px-1">NEXT_PUBLIC_FIREBASE_*</code>
            {" "}variables in <code className="rounded bg-stone-200 px-1">.env.local</code>
            {" "}and restart the dev server.
          </p>
          <p className="text-stone-600">
            See <code className="rounded bg-stone-200 px-1">.env.example</code> for the required keys.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-widest text-navy-700">
            Paws at the Altar
          </p>
          <h1 className="mt-2 font-serif text-2xl text-navy-900">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" ? (
            <div className="space-y-1">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Alex Harper"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          ) : null}

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-stone-500 hover:text-navy-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {displayedError ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {displayedError}
            </p>
          ) : null}

          <Button
            type="submit"
            loading={submitting}
            size="lg"
            className="w-full"
          >
            {mode === "login" ? "Log In" : "Sign Up"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-stone-600">
          {mode === "login" ? (
            <>
              No account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="font-medium text-navy-700 hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-medium text-navy-700 hover:underline"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
