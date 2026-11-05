import Link from "next/link";
import type { Metadata } from "next";
import { SubmitButton } from "@/components/SubmitButton";
import { redirect } from "next/navigation";
import { signup } from "@/app/actions/auth";
import { getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Daftar", robots: { index: false } };

type Props = { searchParams: Promise<{ error?: string }> };

export default async function SignupPage({ searchParams }: Props) {
  if (await getCurrentProfile()) redirect("/dashboard");
  const { error } = await searchParams;

  return (
    <main className="auth-wrap">
      <form action={signup} className="auth-card">
        <Link className="brand" href="/" aria-label="Kembali ke beranda">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span className="brand-name">noncof<span>media</span></span>
        </Link>
        <h1>Daftar akun</h1>
        <p className="auth-help">Akun baru belum bisa menulis. Admin akan mengaktifkan akses penulis setelah kamu mendaftar.</p>
        {error && <p className="notice notice-error" role="alert">{error}</p>}
        <label className="field">
          <span>Nama lengkap</span>
          <input autoComplete="name" minLength={2} name="full_name" required />
        </label>
        <label className="field">
          <span>Email</span>
          <input autoComplete="email" name="email" required type="email" />
        </label>
        <label className="field">
          <span>Kata sandi <small>(minimal 8 karakter)</small></span>
          <input autoComplete="new-password" minLength={8} name="password" required type="password" />
        </label>
        <SubmitButton pendingText="Mendaftar…" className="btn btn-block">Daftar</SubmitButton>
        <p className="auth-alt">Sudah punya akun? <Link href="/login">Masuk</Link></p>
      </form>
    </main>
  );
}
