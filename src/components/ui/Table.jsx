import { clsx } from "clsx";

export function Table({ children, className }) {
  return (
    <div className={clsx("bg-card border border-edge rounded overflow-hidden shadow-card", className)}>
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  );
}

export function Th({ children, className }) {
  return (
    <th
      className={clsx(
        "text-left px-4 py-3.5 text-[11px] font-semibold uppercase tracking-widest text-ink-mute border-b border-edge bg-bg-soft",
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }) {
  return <td className={clsx("px-4 py-3.5 border-b border-edge text-ink", className)}>{children}</td>;
}

export function Tr({ children, className }) {
  return <tr className={clsx("hover:bg-primary/[0.04] last:[&>td]:border-b-0", className)}>{children}</tr>;
}
