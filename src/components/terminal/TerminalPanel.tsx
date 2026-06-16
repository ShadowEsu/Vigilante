interface TerminalPanelProps {
  className?: string;
  children: React.ReactNode;
}

export function TerminalPanel({ className = "", children }: TerminalPanelProps) {
  return (
    <section
      className={`min-h-0 min-w-0 overflow-y-auto px-7 py-6 ${className}`}
      style={{ scrollbarWidth: "thin" }}
    >
      {children}
    </section>
  );
}
