/** Outbound integration event types — stable contract for webhooks & partners. */

export type VigilanteEventType =
  | "brief.created"
  | "signals.detected"
  | "analysis.completed"
  | "company.scrape.completed"
  | "waitlist.signup";

export interface VigilanteEventBase {
  id: string;
  type: VigilanteEventType;
  created_at: string;
  pipeline_version: string;
}

export interface BriefCreatedEvent extends VigilanteEventBase {
  type: "brief.created";
  data: {
    target: string;
    title: string;
    body: string;
    source: "analysis" | "company";
    analysis_id?: string;
    company_id?: string;
    signal_count?: number;
    url?: string;
  };
}

export interface SignalsDetectedEvent extends VigilanteEventBase {
  type: "signals.detected";
  data: {
    target: string;
    analysis_id: string;
    count: number;
    signals: Array<{
      type: string;
      title: string;
      severity: string;
      source_url: string;
    }>;
  };
}

export interface AnalysisCompletedEvent extends VigilanteEventBase {
  type: "analysis.completed";
  data: {
    analysis_id: string;
    target: string;
    signals_created: number;
    brief_created: boolean;
    baseline_created?: boolean;
    skipped?: boolean;
    reason?: string;
  };
}

export interface CompanyScrapeCompletedEvent extends VigilanteEventBase {
  type: "company.scrape.completed";
  data: {
    company_id: string;
    company_name: string;
    domain: string;
    sources_scraped: number;
    changes: number;
    brief_generated: boolean;
  };
}

export type VigilanteEvent =
  | BriefCreatedEvent
  | SignalsDetectedEvent
  | AnalysisCompletedEvent
  | CompanyScrapeCompletedEvent;

export function eventId(): string {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}
