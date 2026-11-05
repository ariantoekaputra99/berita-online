import Link from "next/link";
import type { Metadata } from "next";
import { SubmitButton } from "@/components/SubmitButton";
import { redirect } from "next/navigation";
import { login } from "@/app/actions/auth";
import { getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Masuk", robots: { index: false } };

type Props = { searchParams: Promise<{ error?: string; info?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  if (await getCurrentProfile()) redirect("/dashboard");
  const { error, info } = await searchParams;

  return (
    <main className="auth-wrap">
      <form action={login} className="auth-card">
        <Link className="brand" href="/" aria-label="Kembali ke beranda">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span className="brand-name">noncof<span>media</span></span>
        </Link>
        <h1>Masuk ruang redaksi</h1>
        {error && <p className="notice notice-error" role="alert">{error}</p>}
        {info && <p className="notice">{info}</p>}
        <label className="field">
          <span>Email</span>
          <input autoComplete="email" name="email" required type="email" />
        </label>
        <label className="field">
          <span>Kata sandi</span>
          <input autoComplete="current-password" name="password" required type="password" />
        </label>
        <SubmitButton pendingText="Masuk…" className="btn btn-block">Masuk</SubmitButton>
        <p className="auth-alt">Belum punya akun? <Link href="/daftar">Daftar</Link></p>
      </form>
    </main>
  );
}
