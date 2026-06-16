export interface ShellStats {
  watches: number;
  live: number;
  signals: number;
  spend: number;
  budget: number;
}

export function SectionHeader({
  num,
  title,
  right,
  size = "md",
}: {
  num: string;
  title: string;
  right?: string;
  size?: "md" | "lg";
}) {
  const lg = size === "lg";
  return (
    <div className={`flex items-center gap-3 ${lg ? "mb-6" : "mb-5"}`}>
      <span className={`text-faint tracking-[0.15em] ${lg ? "text-[11px]" : "text-[10px]"}`}>
        {num}
      </span>
      <span
        className={`text-dim tracking-[0.22em] font-medium ${lg ? "text-[13px]" : "text-[10.5px]"}`}
      >
        {title}
      </span>
      <span className="flex-1 h-px bg-edge" />
      {right && (
        <span className={`text-muted tracking-wide ${lg ? "text-[11px]" : "text-[10px]"}`}>
          {right}
        </span>
      )}
    </div>
  );
}

export function SubTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex gap-5 border-b border-edge mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className="bg-transparent border-none font-mono text-[11px] tracking-widest pb-2 cursor-pointer"
          style={{
            color: active === tab.id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
            borderBottom:
              active === tab.id
                ? "1px solid rgba(255,255,255,0.5)"
                : "1px solid transparent",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-7 py-5" style={{ scrollbarWidth: "thin" }}>
      {children}
    </div>
  );
}

