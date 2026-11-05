import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import type { CurrentProfile } from "@/lib/auth";

export function StaffShell({
  profile,
  children,
}: {
  profile: CurrentProfile;
  children: React.ReactNode;
}) {
  const canWrite = profile.role === "writer" || profile.role === "admin";
  return (
    <div className="staff">
      <header className="staff-bar">
        <div className="page-shell staff-bar-inner">
          <Link className="brand" href="/" aria-label="Ke beranda">
            <span className="brand-mark" aria-hidden="true">N</span>
            <span className="brand-name">noncof<span>media</span></span>
          </Link>
          <nav aria-label="Menu ruang redaksi" className="staff-nav">
            <Link href="/dashboard">Berita saya</Link>
            {canWrite && <Link href="/dashboard/baru">Tulis berita</Link>}
            {profile.role === "admin" && (
              <>
                <Link href="/admin">Kelola berita</Link>
                <Link href="/admin/scrap">Scrap</Link>
                <Link href="/admin/pengguna">Pengguna</Link>
              </>
            )}
          </nav>
          <form action={logout} className="staff-user">
            <span>{profile.full_name || profile.email} · {profile.role}</span>
            <SubmitButton pendingText="Keluar…" className="btn btn-ghost btn-small">Keluar</SubmitButton>
          </form>
        </div>
      </header>
      <main className="page-shell staff-main">{children}</main>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    draft: "Draft",
    pending: "Menunggu review",
    published: "Terbit",
    rejected: "Ditolak",
  };
  return <span className={`badge badge-${status}`}>{labels[status] ?? status}</span>;
}
