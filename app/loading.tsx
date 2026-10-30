export default function Loading() {
  return (
    <div role="status" aria-label="Loading Luxe Salon">
      <div className="skeleton hero" />
      <div className="page-content grid-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton block" />
        ))}
      </div>
      <span className="sr-only">A little moment while we get ready…</span>
    </div>
  );
}
