const SITE_URL = "https://factmatch.vercel.app";
const SITE_NAME = "FactMatch";
const SITE_DESC =
  "A beautiful, privacy-first fact discovery app. Learn something new every scroll. Powered by Wikipedia and free knowledge APIs.";
const AUTHOR = "Humaira Ambreen";
const AUTHOR_URL = "https://humairaambreen.vercel.app";

export function GET() {
  const now = new Date().toUTCString();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESC}</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>${AUTHOR_URL} (${AUTHOR})</managingEditor>
    <webMaster>${AUTHOR_URL} (${AUTHOR})</webMaster>
    <image>
      <url>${SITE_URL}/factmatch.png</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}</link>
    </image>
    <item>
      <title>FactMatch — Swipe right on knowledge</title>
      <link>${SITE_URL}</link>
      <description>Discover facts across 63 topics — Science, History, AI, Space, Philosophy and more. Personalized feed, no account required, everything stored locally on your device.</description>
      <pubDate>${now}</pubDate>
      <guid isPermaLink="true">${SITE_URL}</guid>
      <dc:creator>${AUTHOR}</dc:creator>
    </item>
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
