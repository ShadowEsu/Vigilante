"use client";

import { useVigil } from "./useVigil";
import { VigilShell } from "./VigilShell";
import { OverviewView } from "./views/OverviewView";
import { AnalyticsView } from "./views/AnalyticsView";
import { WatchlistsView } from "./views/WatchlistsView";
import { ChangesView } from "./views/ChangesView";
import { BriefView } from "./views/BriefView";
import { DocumentsView } from "./views/DocumentsView";
import { InsightsView } from "./views/InsightsView";
import { NewsletterView } from "./views/NewsletterView";
import { MarketView } from "./views/MarketView";
import { AIView } from "./views/AIView";
import { SettingsView } from "./views/SettingsView";
import { NewWatchView } from "./views/NewWatchView";
import { JetBrains_Mono } from "next/font/google";

const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export function VigilApp() {
  const v = useVigil();

  let content = null;
  switch (v.view) {
    case "overview":
      content = <OverviewView v={v} />;
      break;
    case "analytics":
      content = <AnalyticsView v={v} />;
      break;
    case "watchlists":
      content = <WatchlistsView v={v} />;
      break;
    case "changes":
      content = <ChangesView v={v} />;
      break;
    case "brief":
      content = <BriefView v={v} />;
      break;
    case "documents":
      content = <DocumentsView v={v} />;
      break;
    case "insights":
      content = <InsightsView v={v} />;
      break;
    case "newsletter":
      content = <NewsletterView v={v} />;
      break;
    case "market":
      content = <MarketView v={v} />;
      break;
    case "ai":
      content = <AIView v={v} />;
      break;
    case "settings":
      content = <SettingsView v={v} />;
      break;
    case "new":
      content = <NewWatchView v={v} />;
      break;
    default:
      content = <OverviewView v={v} />;
  }

  return (
    <div className={jetbrains.className} style={{ height: "100vh", overflow: "hidden" }}>
      <VigilShell v={v}>{content}</VigilShell>
    </div>
  );
}
