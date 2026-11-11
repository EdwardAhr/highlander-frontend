"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { requestOtp } from "@/lib/queries";
import { apiError } from "@/lib/errors";
import { Button, Spinner } from "@/components/ui";

const inputCls =
  "rounded-control border border-border bg-surface px-3 py-2 outline-none focus:border-accent focus:shadow-glow";

export default function LoginPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/cabinet";
  const { login, loginWithOtp } = useAuth();

  const [mode, setMode] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      setLoading(false);
      setSuccess(true);
      await new Promise((r) => setTimeout(r, 350));
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(apiError(err));
      setLoading(false);
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestOtp(email);
      setLoading(false);
      setOtpSent(true);
    } catch (err) {
      setError(apiError(err));
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithOtp(email, code);
      setLoading(false);
      setSuccess(true);
      await new Promise((r) => setTimeout(r, 350));
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(apiError(err));
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-display text-2xl font-normal tracking-tight">Вход</h1>
      <p className="mt-1 text-sm text-muted">
        Нет аккаунта?{" "}
        <Link href="/register" className="font-medium text-accent underline underline-offset-2">
          Зарегистрироваться
        </Link>
      </p>

      <div className="relative mt-5 flex rounded-control bg-fog p-1">
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 w-[calc(50%_-_4px)] rounded-md bg-surface shadow-card transition-transform duration-300 ease-out"
          style={{ transform: mode === "otp" ? "translateX(100%)" : "translateX(0)" }}
        />
        {(["password", "otp"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`relative z-10 flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === m ? "text-foreground" : "text-muted"
            }`}
          >
            {m === "password" ? "По паролю" : "По коду (OTP)"}
          </button>
        ))}
      </div>

      {mode === "password" ? (
        <form onSubmit={handlePassword} className="mt-5 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-muted">Пароль</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </label>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <Button
            type="submit"
            loading={loading}
            success={success}
            error={!!error}
            disabled={loading || success}
          >
            Войти
          </Button>
        </form>
      ) : (
        <form
          onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
          className="mt-5 flex flex-col gap-3"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              disabled={otpSent}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputCls} disabled:bg-fog`}
            />
          </label>

          {otpSent ? (
            <label className="field-reveal flex flex-col gap-1 text-sm">
              <span className="font-medium text-muted">Код</span>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6 цифр"
                className={inputCls}
              />
              <span className="text-xs text-faint">
                В dev-режиме (DEBUG=true) код печатается в консоль бэкенда.
              </span>
            </label>
          ) : null}

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <Button
            type="submit"
            loading={loading}
            success={success}
            error={!!error}
            disabled={loading || success}
          >
            {otpSent ? "Подтвердить" : "Отправить код"}
          </Button>
        </form>
      )}
    </div>
  );
}
