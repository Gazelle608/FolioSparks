import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

export function Dropdown({ trigger, items, align = "right" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open)
      return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open)
      return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")
        setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="focus:outline-none"
      >
        {trigger}
      </button>

      {open && (
        <div
          role="menu"
          className={[
            "absolute top-full mt-2 z-40 min-w-[180px]",
            "bg-white border border-primary-100 rounded-md shadow-lg",
            "py-1 animate-slideUp",
            align === "right" ? "right-0" : "left-0",
          ].join(" ")}
        >
          {items.map((item) => {
            if (item.divider) {
              return (
                <div
                  key={item.id}
                  className="my-1 h-px bg-primary-100"
                  role="separator"
                />
              );
            }
            return (
              <button
                key={item.id}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className={[
                  "w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm",
                  "transition-colors",
                  item.danger
                    ? "text-danger hover:bg-red-50"
                    : "text-primary-800 hover:bg-primary-50",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                ].join(" ")}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
