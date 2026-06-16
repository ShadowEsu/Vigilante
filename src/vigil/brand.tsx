"use client";

/** Favicon / logo for a company domain */
export function CompanyLogo({ domain, name, size = 28 }: { domain?: string; name?: string; size?: number }) {
  const d = domain?.replace(/^www\./, "") || "example.com";
  const letter = (name || d).charAt(0).toUpperCase();
  const src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=64`;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flexShrink: 0,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        overflow: "hidden",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={size - 6}
        height={size - 6}
        style={{ objectFit: "contain" }}
        onError={(e) => {
          const el = e.currentTarget;
          el.style.display = "none";
          const parent = el.parentElement;
          if (parent && !parent.querySelector("[data-fallback]")) {
            const span = document.createElement("span");
            span.dataset.fallback = "1";
            span.textContent = letter;
            span.style.fontSize = `${Math.round(size * 0.4)}px`;
            span.style.color = "rgba(255,255,255,0.65)";
            parent.appendChild(span);
          }
        }}
      />
    </span>
  );
}

export function newsletterThumb(url?: string, domain?: string) {
  if (url) {
    try {
      const host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
    } catch {
      /* fall through */
    }
  }
  if (domain) return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  return null;
}
