export default async function BorrowerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="kfx" style={{ minHeight: "100vh", padding: 20 }}>
      <h1 className="h1">Borrower #{id}</h1>
      <p className="small" style={{ marginTop: 8 }}>
        Coming in Phase B — balance hero, action buttons, ledger.
      </p>
    </main>
  );
}
