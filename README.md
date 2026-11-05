# Noncof Media

Portal berita berbahasa Indonesia yang dibangun dengan Next.js App Router, siap dijalankan secara lokal atau di-deploy ke Vercel.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Deploy ke Vercel

Impor repository ini sebagai project Next.js di Vercel. Setelah deployment, tambahkan `noncofmedia.my.id` dan `www.noncofmedia.my.id` pada **Project Settings → Domains** jika kedua alamat ingin digunakan. Domain kanonis situs telah ditetapkan ke `https://noncofmedia.my.id` pada metadata. Pastikan konfigurasi DNS yang diminta Vercel tetap mengikuti konfigurasi Cloudflare yang sudah ada; file aplikasi ini tidak mengubah DNS.

## Fitur redaksi

- **Penulis** (`/dashboard`): menulis berita dengan judul, isi, gambar utama (upload ke Supabase Storage), kategori, dan tag. Berita dikirim sebagai draft atau untuk ditinjau.
- **Admin** (`/admin`): meninjau, menerbitkan, menolak, mengedit, atau menghapus semua berita; mengelola peran pengguna (`/admin/pengguna`).
- **Scrap berita** (`/admin/scrap`): mengambil judul, ringkasan, gambar utama, dan tautan asli dari feed RSS media tepercaya (awal: ANTARA, CNN Indonesia). Hasil masuk sebagai **draft** dengan atribusi sumber; isi artikel lengkap tidak disalin.

## Konfigurasi

1. Salin `.env.example` menjadi `.env.local` (isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). Tambahkan juga di **Vercel → Project Settings → Environment Variables**.
2. Skema database, kebijakan RLS, bucket `article-images`, dan kategori awal ada di project Supabase `berita-online`. Akses penulis/admin dijaga di level database (RLS), bukan hanya di UI.
3. Akun yang mendaftar di `/daftar` berperan `reader` (tanpa akses). Untuk membuat **admin pertama**, daftar lewat `/daftar`, lalu jalankan di Supabase SQL Editor:

   ```sql
   update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'EMAIL_KAMU');
   ```

   Setelah itu admin bisa mengubah peran pengguna lain (writer/admin) dari `/admin/pengguna`.
