export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="section-head page-head">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function StatCards({ items }) {
  return (
    <section className="stats-grid">
      {items.map((item) => (
        <article className="stat-card" key={item.label}>
          <span className="label">{item.label}</span>
          <strong className="val">{item.value}</strong>
          {item.sub ? <span className="sub">{item.sub}</span> : null}
        </article>
      ))}
    </section>
  );
}

export function EmptyState({ title, description }) {
  return (
    <section className="surface pad empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </section>
  );
}

export function AccessDenied({ title, description }) {
  return (
    <section className="surface pad empty-state">
      <span className="badge">Akses Dibatasi</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </section>
  );
}

export function Modal({ open, title, children, footer, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-root open" onClick={onClose} role="presentation">
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="close" type="button" onClick={onClose} aria-label="Tutup modal">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-foot">{footer}</div>
      </div>
    </div>
  );
}

export function ToastStack({ items }) {
  if (!items.length) return null;

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {items.map((item) => (
        <div className={`toast ${item.type || "info"}`} key={item.id}>
          <span className="toast-icon">{item.type === "success" ? "✓" : item.type === "error" ? "!" : "i"}</span>
          <span>{item.message}</span>
        </div>
      ))}
    </div>
  );
}
