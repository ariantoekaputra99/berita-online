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
