import Card from "../../../components/ui/Card";

export default function AuthFormCard({
  title,
  description,
  children,
  footer,
  className = "",
}) {
  return (
    <Card
      className={[
        "w-full max-w-md rounded-[22px]",
        "border border-line-soft",
        "bg-surface/95",
        "p-6 md:p-8",
        "shadow-soft",
        "backdrop-blur",
        className,
      ].join(" ")}
    >
      {(title || description) && (
        <div className="mb-6 space-y-2">
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
              {title}
            </h2>
          )}

          {description && (
            <p className="text-sm leading-relaxed text-muted">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-4">{children}</div>

      {footer && (
        <div className="mt-6 border-t border-line-soft pt-4 text-center text-sm text-muted">
          {footer}
        </div>
      )}
    </Card>
  );
}
