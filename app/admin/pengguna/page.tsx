import { setUserRole } from "@/app/actions/users";
import { SubmitButton } from "@/components/SubmitButton";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function UsersPage() {
  const me = await requireRole(["admin"]);
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <section>
      <div className="panel-head"><h1>Pengguna</h1></div>
      <p className="notice">Pengguna baru berperan <strong>reader</strong> (belum bisa menulis). Ubah ke <strong>writer</strong> agar bisa mengirim berita.</p>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Nama</th><th>Peran</th><th>Bergabung</th></tr>
          </thead>
          <tbody>
            {(users ?? []).map((user) => (
              <tr key={user.id}>
                <td data-label="Nama">{user.full_name || "(tanpa nama)"}{user.id === me.id && <small className="muted"> · kamu</small>}</td>
                <td data-label="Peran">
                  {user.id === me.id ? (
                    user.role
                  ) : (
                    <form action={setUserRole} className="inline-form">
                      <input name="id" type="hidden" value={user.id} />
                      <select defaultValue={user.role} name="role" aria-label={`Peran ${user.full_name}`}>
                        <option value="reader">reader</option>
                        <option value="writer">writer</option>
                        <option value="admin">admin</option>
                      </select>
                      <SubmitButton pendingText="Menyimpan…" confirm="Ubah peran pengguna ini?" className="btn btn-ghost btn-small">Simpan</SubmitButton>
                    </form>
                  )}
                </td>
                <td data-label="Bergabung">{new Date(user.created_at).toLocaleDateString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
