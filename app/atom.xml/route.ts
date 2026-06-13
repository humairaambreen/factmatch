const SITE_URL = "https://factmatch.vercel.app";
const SITE_NAME = "FactMatch";
const SITE_DESC =
  "A beautiful, privacy-first fact discovery app. Learn something new every scroll. Powered by Wikipedia and free knowledge APIs.";
const AUTHOR = "Humaira Ambreen";
const AUTHOR_URL = "https://humairaambreen.vercel.app";

export function GET() {
  const now = new Date().toISOString();

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${SITE_NAME}</title>
  <subtitle>${SITE_DESC}</subtitle>
  <link href="${SITE_URL}" rel="alternate" type="text/html"/>
  <link href="${SITE_URL}/atom.xml" rel="self" type="application/atom+xml"/>
  <id>${SITE_URL}/</id>
  <updated>${now}</updated>
  <author>
    <name>${AUTHOR}</name>
    <uri>${AUTHOR_URL}</uri>
  </author>
  <icon>${SITE_URL}/factmatch.png</icon>
  <logo>${SITE_URL}/factmatch.png</logo>
  <rights>Copyright ${new Date().getFullYear()} ${AUTHOR}</rights>
  <entry>
    <title>FactMatch — Swipe right on knowledge</title>
    <link href="${SITE_URL}" rel="alternate" type="text/html"/>
    <id>${SITE_URL}/</id>
    <updated>${now}</updated>
    <summary>Discover facts across 63 topics — Science, History, AI, Space, Philosophy and more. Personalized feed, no account required, everything stored locally on your device.</summary>
    <author>
      <name>${AUTHOR}</name>
      <uri>${AUTHOR_URL}</uri>
    </author>
  </entry>
</feed>`;

  return new Response(atom, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
