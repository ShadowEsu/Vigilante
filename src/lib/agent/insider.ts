export type InsiderMoveType = "HIRED" | "DEPARTED" | "PROMOTED" | "LAYOFF" | "ROLE POSTED" | "TEAM CHANGE";

export interface ExtractedInsiderMove {
  person: string;
  role: string;
  moveType: InsiderMoveType;
  note: string;
}

const ROLE_RE = /(?:hiring|join(?:ed|ing)|welcome|appointed|promoted to|departed|leaving|laid off|open role|job opening)[^.!?\n]{10,120}/gi;

export function extractInsiderFromCareers(text: string, companyName: string): ExtractedInsiderMove[] {
  const moves: ExtractedInsiderMove[] = [];
  const roleCount = (text.match(/\b(engineer|manager|director|vp|sales|designer|product)\b/gi) ?? []).length;
  const openings = (text.match(/open (role|position|job)|we're hiring|now hiring/gi) ?? []).length;

  if (openings > 0) {
    moves.push({
      person: `${companyName} careers`,
      role: `${openings}+ open roles detected`,
      moveType: "ROLE POSTED",
      note: "Active hiring signals on careers page — team expansion likely",
    });
  }

  if (roleCount > 8) {
    moves.push({
      person: companyName,
      role: "Headcount indicators",
      moveType: "TEAM CHANGE",
      note: `${roleCount} role keywords indexed on careers page`,
    });
  }

  let match: RegExpExecArray | null;
  const re = ROLE_RE;
  while ((match = re.exec(text)) !== null && moves.length < 5) {
    const snippet = match[0].trim();
    let moveType: InsiderMoveType = "TEAM CHANGE";
    if (/hiring|open role|job opening/i.test(snippet)) moveType = "ROLE POSTED";
    else if (/join|welcome|appointed|promoted/i.test(snippet)) moveType = "HIRED";
    else if (/depart|leaving/i.test(snippet)) moveType = "DEPARTED";
    else if (/laid off|layoff/i.test(snippet)) moveType = "LAYOFF";

    moves.push({
      person: "—",
      role: snippet.slice(0, 80),
      moveType,
      note: "Extracted from careers / about page",
    });
  }

  return moves.slice(0, 6);
}

export function isCareersUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes("career") || u.includes("/jobs") || u.includes("greenhouse") || u.includes("lever.co");
}
