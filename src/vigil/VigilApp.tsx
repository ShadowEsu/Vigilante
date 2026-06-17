"use client";

import dynamic from "next/dynamic";
import { useVigil } from "./useVigil";
import { VigilShell } from "./VigilShell";

const OverviewView = dynamic(() => import("./views/OverviewView").then((m) => ({ default: m.OverviewView })));
const AnalyticsView = dynamic(() => import("./views/AnalyticsView").then((m) => ({ default: m.AnalyticsView })));
const WatchlistsView = dynamic(() => import("./views/WatchlistsView").then((m) => ({ default: m.WatchlistsView })));
const ChangesView = dynamic(() => import("./views/ChangesView").then((m) => ({ default: m.ChangesView })));
const BriefView = dynamic(() => import("./views/BriefView").then((m) => ({ default: m.BriefView })));
const DocumentsView = dynamic(() => import("./views/DocumentsView").then((m) => ({ default: m.DocumentsView })));
const InsightsView = dynamic(() => import("./views/InsightsView").then((m) => ({ default: m.InsightsView })));
const NewsletterView = dynamic(() => import("./views/NewsletterView").then((m) => ({ default: m.NewsletterView })));
const MarketView = dynamic(() => import("./views/MarketView").then((m) => ({ default: m.MarketView })));
const AIView = dynamic(() => import("./views/AIView").then((m) => ({ default: m.AIView })));
const SettingsView = dynamic(() => import("./views/SettingsView").then((m) => ({ default: m.SettingsView })));
const NewWatchView = dynamic(() => import("./views/NewWatchView").then((m) => ({ default: m.NewWatchView })));

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
    <div className="font-mono" style={{ height: "100vh", overflow: "hidden" }}>
      <VigilShell v={v}>{content}</VigilShell>
    </div>
  );
}
