"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const fail = (path: string, message: string) => redirect(`${path}?error=${encodeURIComponent(message)}`);

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) fail("/login", "Email dan kata sandi wajib diisi.");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) fail("/login", "Email atau kata sandi salah.");

  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (fullName.length < 2) fail("/daftar", "Nama lengkap minimal 2 karakter.");
  if (!email) fail("/daftar", "Email wajib diisi.");
  if (password.length < 8) fail("/daftar", "Kata sandi minimal 8 karakter.");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) fail("/daftar", "Pendaftaran gagal. Coba email lain atau ulangi nanti.");

  if (!data.session) {
    redirect(`/login?info=${encodeURIComponent("Pendaftaran berhasil. Cek email kamu untuk konfirmasi, lalu masuk.")}`);
  }
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
