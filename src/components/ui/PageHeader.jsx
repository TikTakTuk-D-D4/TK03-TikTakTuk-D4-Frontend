export function PageHeader({ kicker, title, subtitle, action }) {
  return (
    <div className="flex justify-between items-end flex-wrap gap-4 mb-7 pb-5 border-b border-edge">
      <div>
        {kicker ? (
          <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-mute mb-1">
            {kicker}
          </div>
        ) : null}
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-ink-dim text-sm mt-1">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
