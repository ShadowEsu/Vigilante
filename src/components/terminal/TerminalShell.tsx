"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertsProvider } from "@/components/notifications/AlertsContext";
import { NAV_ITEMS, navIsActive, navPageTitle } from "@/lib/nav";
import { navAccent } from "@/lib/ui/type-colors";
import { StatusBar } from "./StatusBar";
import type { ShellStats } from "./ui";

interface TerminalShellProps {
  basePath: string;
  userLabel?: string;
  footerNote?: string;
  footerAction?: React.ReactNode;
  stats: ShellStats;
  demo?: boolean;
  children: React.ReactNode;
}

export function TerminalShell({
  basePath,
  userLabel = "Signed in",
  footerNote,
  footerAction,
  stats,
  demo = false,
  children,
}: TerminalShellProps) {
  const pathname = usePathname();
  const title = navPageTitle(pathname, basePath);

  return (
    <AlertsProvider>
      <div className="vigilant-shell h-screen grid overflow-hidden font-mono">
        <aside className="vigilant-sidebar flex flex-col min-h-0 border-r">
          <div className="vigilant-sidebar-header flex items-center gap-2.5 px-5 py-5 border-b">
            <span
              className="inline-flex items-center justify-center w-6 h-6 text-xs border"
              style={{ borderColor: "rgba(255,255,255,0.4)" }}
            >
              V
            </span>
            <span className="text-xs font-semibold tracking-[0.18em]">VIGILANTE</span>
            <span className="ml-auto text-[9px] text-faint tracking-widest">v0.5</span>
          </div>

          <nav className="vigilant-nav flex-1 py-2 px-2.5 flex flex-col gap-0.5 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const href = `${basePath}${item.href}`;
              const active = navIsActive(pathname, basePath, item.href);

              return (
                <Link
                  key={item.label}
                  href={href}
                  className="flex items-center gap-2.5 px-2.5 py-2 no-underline text-left w-full"
                  style={{
                    background: active ? "rgba(255,255,255,0.05)" : "transparent",
                    borderLeft: active
                      ? `2px solid ${navAccent(item.label)}`
                      : "2px solid transparent",
                    color: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)",
                  }}
                >
                  <span className="text-[9px] tracking-widest text-faint w-4">{item.idx}</span>
                  <span className="flex-1 text-[11px] tracking-wide truncate">{item.label}</span>
                  <span className="text-[8px] text-faint hidden xl:inline">{item.hint}</span>
                </Link>
              );
            })}
          </nav>

          <div
            className="px-5 py-4 border-t text-[10px]"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-2 tracking-wide text-dim">
              <span className="text-[7px]">◆</span>
              {userLabel.toUpperCase()}
            </div>
            {footerNote && (
              <div className="text-faint mt-1.5 leading-relaxed" style={{ fontSize: 10 }}>
                {footerNote}
              </div>
            )}
            {footerAction && <div className="mt-2">{footerAction}</div>}
          </div>
        </aside>

        <div className="vigilant-main-col flex flex-col min-w-0 min-h-0 overflow-hidden">
          <StatusBar stats={stats} demo={demo} title={title} />
          <main className="vigilant-main flex-1 min-h-0 overflow-hidden flex flex-col">
            {children}
          </main>
        </div>
      </div>
    </AlertsProvider>
  );
}
