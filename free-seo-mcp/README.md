# Free SEO MCP

A free SEO helper for Claude. No paid APIs, no API keys.

Tools Claude gets:
- **audit_page**: checks one URL for title and meta description length, headings, image alt text, noindex, lang, viewport, canonical, thin content, and links.
- **audit_site**: crawls one site (same domain only, up to 100 pages), checks each page, finds broken internal links, and checks robots.txt and sitemap.xml.
- **keyword_ideas**: keyword suggestions from Google's public autocomplete. These show what people type, not search volume.

## Setup (on your computer)

Needs Python 3.10 or newer.

```bash
cd free-seo-mcp
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt     # Windows: .venv\Scripts\pip install -r requirements.txt
```

Add it to Claude Code (use the full path to this folder):

```bash
claude mcp add free-seo -- /full/path/to/free-seo-mcp/.venv/bin/python /full/path/to/free-seo-mcp/server.py
```

Windows: use `.venv\Scripts\python.exe` in place of `.venv/bin/python`.

Then start Claude Code and ask, for example: *"Audit https://example.com with free-seo"* or *"Give me keyword ideas for running shoes."*

## Limits
- Audits read only the public HTML. They don't measure page speed or Core Web Vitals.
- `keyword_ideas` doesn't give search volume or difficulty. Those need paid data, such as DataForSEO.
- Google may rate-limit autocomplete if you run it many times in a row.
- The crawler is polite and sequential, so large sites take a while.
