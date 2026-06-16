/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoBase = process.env.GITHUB_PAGES_BASE_PATH || "/Vigilante";

const nextConfig = {
  ...(isGithubPages
    ? {
        output: "export",
        basePath: repoBase,
        assetPrefix: repoBase.endsWith("/") ? repoBase : `${repoBase}/`,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
  env: {
    NEXT_PUBLIC_GITHUB_PAGES: isGithubPages ? "true" : "false",
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? repoBase : "",
  },
};

export default nextConfig;
