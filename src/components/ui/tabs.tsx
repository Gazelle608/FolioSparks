import { type ReactNode, useState } from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  className = "",
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id);
  const active = value ?? internal;

  const handleSelect = (id: string) => {
    if (value === undefined)
      setInternal(id);
    onChange?.(id);
  };

  return (
    <div
      role="tablist"
      className={[
        "flex items-center gap-1 border-b border-primary-100",
        className,
      ].join(" ")}
    >
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            disabled={item.disabled}
            onClick={() => handleSelect(item.id)}
            className={[
              "relative inline-flex items-center gap-2 px-4 py-2.5 -mb-px",
              "text-sm font-medium transition-colors",
              "border-b-2",
              isActive
                ? "border-primary-500 text-primary-900"
                : "border-transparent text-primary-500 hover:text-primary-700",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            {item.icon}
            {item.label}
            {item.badge !== undefined && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-primary-100 text-primary-700">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  id: string;
  activeId: string;
  children: ReactNode;
}

export function TabPanel({ id, activeId, children }: TabPanelProps) {
  if (id !== activeId)
    return null;
  return <div role="tabpanel">{children}</div>;
}
