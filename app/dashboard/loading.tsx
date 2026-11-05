export default function Loading() {
  return (
    <main className="page-shell" style={{ display: "grid", placeItems: "center", minHeight: "50vh" }}>
      <span aria-label="Memuat" className="spinner spinner-lg" role="status" />
    </main>
  );
}
