export default function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <img src="/images/placeholders/empty-state.jpeg" alt="" style={{ width: 120, height: 90, objectFit: "cover", opacity: 0.8 }} />
      <div className="mono-label">{message}</div>
    </div>
  );
}
