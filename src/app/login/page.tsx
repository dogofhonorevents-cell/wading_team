"use client";

import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  Eye,
  EyeOff,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth-provider";

type Mode = "login" | "signup" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    signup,
    sendPasswordReset,
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
  const [resetSentTo, setResetSentTo] = useState<string | null>(null);
  const [pendingSignupEmail, setPendingSignupEmail] = useState<string | null>(
    null
  );

  const displayedError = error ?? authError;
  const isPendingApprovalError =
    displayedError !== null &&
    /awaiting approval|pending approval/i.test(displayedError);

  useEffect(() => {
    if (user && !loading) {
      router.replace(user.role === "admin" ? "/admin" : "/team");
    }
  }, [user, loading, router]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setResetSentTo(null);
    setPendingSignupEmail(null);
    clearAuthError();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    clearAuthError();
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else if (mode === "signup") {
        await signup(email, password, name.trim() || undefined);
        setPendingSignupEmail(email.trim());
      } else {
        await sendPasswordReset(email.trim());
        setResetSentTo(email.trim());
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
        <div className="max-w-lg rounded-xl border border-blush-300 bg-blush-50 p-6 text-sm text-sage-800">
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Dog of Honor Weddings & Events"
            className="mx-auto mb-3 h-16 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <p className="text-xs uppercase tracking-widest text-sage-600">
            Dog of Honor — Weddings &amp; Events
          </p>
          <h1 className="mt-2 font-serif text-2xl text-sage-900">
            {mode === "login"
              ? "Welcome back"
              : mode === "signup"
              ? "Create your account"
              : "Reset your password"}
          </h1>
          {mode === "forgot" ? (
            <p className="mt-2 text-sm text-stone-600">
              Enter your email and we&apos;ll send you a secure link to set a new password.
            </p>
          ) : null}
        </div>

        {mode === "forgot" && resetSentTo ? (
          <ResetSentNotice
            email={resetSentTo}
            onBackToLogin={() => switchMode("login")}
          />
        ) : isPendingApprovalError ? (
          <PendingApprovalNotice
            email={pendingSignupEmail ?? email.trim()}
            justSignedUp={mode === "signup"}
            onBackToLogin={() => switchMode("login")}
          />
        ) : (
          <>
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

              {mode !== "forgot" ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === "login" ? (
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs font-medium text-sage-700 hover:underline"
                      >
                        Forgot password?
                      </button>
                    ) : null}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
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
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-stone-500 hover:text-sage-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ) : null}

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
                {mode === "login"
                  ? "Log In"
                  : mode === "signup"
                  ? "Sign Up"
                  : "Send reset link"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-stone-600">
              {mode === "login" ? (
                <>
                  No account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="font-medium text-sage-700 hover:underline"
                  >
                    Sign up
                  </button>
                </>
              ) : mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-medium text-sage-700 hover:underline"
                  >
                    Log in
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="inline-flex items-center gap-1 font-medium text-sage-700 hover:underline"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to log in
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function PendingApprovalNotice({
  email,
  justSignedUp,
  onBackToLogin,
}: {
  email: string;
  justSignedUp: boolean;
  onBackToLogin: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-blush-300 bg-blush-50 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush-300 text-sage-900">
            <Clock className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-sage-900">
              {justSignedUp
                ? "Account created — pending approval"
                : "Your account is pending approval"}
            </p>
            {email ? (
              <p className="mt-1 text-sm text-sage-800 break-all">{email}</p>
            ) : null}
            <p className="mt-2 text-sm text-sage-800">
              {justSignedUp
                ? "Thanks for signing up! The site owner needs to approve your account before you can log in. You'll be able to access the app once they approve you."
                : "The site owner needs to approve your account before you can log in. Please reach out to them if it's been a while."}
            </p>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={onBackToLogin}
      >
        Back to log in
      </Button>
    </div>
  );
}

function ResetSentNotice({
  email,
  onBackToLogin,
}: {
  email: string;
  onBackToLogin: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-sage-200 bg-sage-50 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-700 text-white">
            <Mail className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-sage-900">
              Check your inbox
            </p>
            <p className="mt-1 text-sm text-sage-800">
              We&apos;ve emailed a password reset link to{" "}
              <strong className="break-all">{email}</strong>. Open the email and
              follow the link to set a new password.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-blush-300 bg-blush-50 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush-300 text-sage-900">
            <ShieldAlert className="h-4 w-4" />
          </span>
          <div className="flex-1 text-sm text-sage-900">
            <p className="font-semibold">Can&apos;t find the email?</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sage-800">
              <li>
                It can take a minute or two to arrive — please be patient.
              </li>
              <li>
                <strong>Check your Spam or Junk folder.</strong> Reset links
                from Firebase sometimes land there. If you find it in spam,
                mark it as &ldquo;Not Spam&rdquo; so future emails reach your
                inbox.
              </li>
              <li>Search for &ldquo;noreply&rdquo; or &ldquo;Firebase&rdquo;.</li>
              <li>
                Make sure the email above is the one you used when you signed
                up.
              </li>
              <li>
                The reset link expires in about an hour — request a new one if
                you wait too long.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={onBackToLogin}
      >
        Back to log in
      </Button>
    </div>
  );
}
