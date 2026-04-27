import { useEffect } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
}) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("keydown", onKeyDown);
    }

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-5 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={clsx(
          "w-full bg-card border border-edge-glow rounded-lg p-7 max-h-[90vh] overflow-y-auto shadow-glow animate-pop-in",
          size === "lg" ? "max-w-180" : "max-w-130"
        )}
      >
        <div className="flex items-start justify-between pb-4 mb-5 border-b border-edge">
          <div>
            <h3 className="font-display font-semibold text-lg tracking-tight">{title}</h3>
            {subtitle ? <p className="text-sm text-ink-dim mt-1">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="text-ink-mute hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div>{children}</div>

        {footer ? (
          <div className="flex gap-2.5 justify-end mt-5 pt-4 border-t border-edge">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
