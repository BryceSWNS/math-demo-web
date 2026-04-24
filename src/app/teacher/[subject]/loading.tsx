export default function Loading() {
  return (
    <section className="section-gap">
      <div className="skeleton-heading" />
      <div className="skeleton-text-short" />
      <div className="stack">
        {Array.from({ length: 4 }, (_, i) => (
          <article key={i} className="card skeleton-card">
            <div className="skeleton-heading-sm" />
            <div className="skeleton-text-short" />
            <div className="skeleton-text" />
            <div className="skeleton-text" />
          </article>
        ))}
      </div>
    </section>
  );
}
