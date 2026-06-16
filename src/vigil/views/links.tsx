"use client";

const LINK = "#6E9BE6";

export function ExternalLink({
  href,
  children,
  style,
}: {
  href: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  if (!href) return <span style={style}>{children}</span>;
  return (
    <a
      href={href.startsWith("http") ? href : `https://${href}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: LINK,
        textDecoration: "none",
        wordBreak: "break-all",
        overflowWrap: "anywhere",
        maxWidth: "100%",
        display: "inline-block",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.textDecoration = "underline";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.textDecoration = "none";
      }}
    >
      {children}
    </a>
  );
}

export function shortUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("?")[0];
}
