import type { APIRoute } from "astro";

type SitemapPage = {
  path: string;
  lastmod?: string;
  priority: string;
  changefreq: string;
};

const staticPages = [
  { path: "", lastmod: "2026-05-04T19:37:41Z", priority: "1.0", changefreq: "weekly" },
  { path: "depannage.html", lastmod: "2026-05-04T19:37:41Z", priority: "0.9", changefreq: "monthly" },
  { path: "espace-pro.html", lastmod: "2026-05-04T19:37:41Z", priority: "0.9", changefreq: "monthly" },
  { path: "conseils-actualites.html", priority: "0.7", changefreq: "monthly" },
  { path: "realisations.html", priority: "0.7", changefreq: "monthly" },
  { path: "apropos.html", lastmod: "2026-05-04T19:37:41Z", priority: "0.6", changefreq: "yearly" },
  { path: "contact.html", lastmod: "2026-05-04T19:37:41Z", priority: "0.8", changefreq: "monthly" },
];

const escapeXml = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL("https://tech46services.fr");
  
  const pages: SitemapPage[] = staticPages;

  const entries = pages
    .map(
      ({ path, lastmod, priority, changefreq }) => `  <url>
    <loc>${escapeXml(new URL(path, baseUrl).href)}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
    )
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
