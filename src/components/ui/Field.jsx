export function Field({ label, hint, error, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs font-semibold text-ink-dim mb-1.5 tracking-wide">
        {label}
      </span>
      {children}
      {error ? <p className="text-xs text-danger mt-1">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-ink-mute mt-1">{hint}</p> : null}
    </label>
  );
}
