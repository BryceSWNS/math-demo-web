export default function Loading() {
  return (
    <section className="section-gap">
      <article className="card skeleton-card">
        <div className="skeleton-heading" />
        <div className="skeleton-text-short" />
        <div className="skeleton-text" />
        <div className="skeleton-text" />
        <div className="skeleton-text" />
        <div className="skeleton-text" style={{ width: "60%" }} />
      </article>
      <div className="card skeleton-card">
        <div className="skeleton-heading-sm" />
        <div className="skeleton-text" />
        <div className="skeleton-text" style={{ width: "80%" }} />
      </div>
    </section>
  );
}
