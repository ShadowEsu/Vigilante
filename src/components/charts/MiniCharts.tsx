"use client";

interface BudgetBarProps {
  spend: number;
  budget: number;
  showLabels?: boolean;
}

export function BudgetBar({ spend, budget, showLabels = true }: BudgetBarProps) {
  const pct = budget > 0 ? Math.min((spend / budget) * 100, 100) : 0;
  const filled = Math.round(pct / 10);
  const fill = "█".repeat(filled);
  const track = "░".repeat(10 - filled);
  const fillColor = pct >= 100 ? "#D178C9" : pct >= 75 ? "#E3B341" : "#6E9BE6";

  return (
    <div className="space-y-1">
      {showLabels && (
        <div className="flex justify-between text-[12px] font-mono text-muted">
          <span>budget</span>
          <span className="tabular-nums" style={{ color: fillColor }}>
            ${spend.toFixed(2)}/${budget.toFixed(2)}
          </span>
        </div>
      )}
      <span className="text-[13px] tracking-wide">
        <span style={{ color: fillColor }}>{fill}</span>
        <span className="text-faint">{track}</span>
      </span>
    </div>
  );
}
