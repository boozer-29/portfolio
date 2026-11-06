"""Free SEO tools for Claude (MCP server).

Tools:
  audit_page       - on-page SEO checks for one URL
  audit_site       - crawl a site (same domain) and check pages, robots.txt, sitemap
  keyword_ideas    - keyword suggestions from Google's public autocomplete

No paid APIs and no API keys. Only fetches pages you ask for.
"""

import asyncio
import re
from collections import deque
from urllib.parse import urljoin, urlparse, urlunparse

import httpx
from bs4 import BeautifulSoup
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("free-seo")

HEADERS = {
    "User-Agent": "free-seo-mcp/0.1 (+personal SEO audit tool)",
    "Accept": "text/html,application/xhtml+xml",
}
TIMEOUT = 15.0
MAX_PAGES_CAP = 100


def _normalize(url: str) -> str:
    url = url.strip()
    if not re.match(r"^https?://", url, re.I):
        url = "https://" + url
    p = urlparse(url)
    if p.scheme not in ("http", "https") or not p.netloc:
        raise ValueError(f"Not a valid http(s) URL: {url}")
    return urlunparse((p.scheme, p.netloc, p.path or "/", "", p.query, ""))


def _strip_fragment(url: str) -> str:
    p = urlparse(url)
    return urlunparse((p.scheme, p.netloc, p.path or "/", "", p.query, ""))


def _audit_html(url: str, html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    issues, passed = [], []

    title = (soup.title.string or "").strip() if soup.title else ""
    if not title:
        issues.append("Missing <title> tag")
    elif len(title) < 30 or len(title) > 60:
        issues.append(f"Title is {len(title)} characters (aim for 30-60)")
    else:
        passed.append(f"Title length OK ({len(title)} characters)")

    desc_tag = soup.find("meta", attrs={"name": re.compile("^description$", re.I)})
    desc = (desc_tag.get("content") or "").strip() if desc_tag else ""
    if not desc:
        issues.append("Missing meta description")
    elif len(desc) < 70 or len(desc) > 160:
        issues.append(f"Meta description is {len(desc)} characters (aim for 70-160)")
    else:
        passed.append(f"Meta description length OK ({len(desc)} characters)")

    h1s = soup.find_all("h1")
    if len(h1s) == 0:
        issues.append("No <h1> heading")
    elif len(h1s) > 1:
        issues.append(f"{len(h1s)} <h1> headings (use one)")
    else:
        passed.append("Exactly one <h1>")

    imgs = soup.find_all("img")
    no_alt = [i.get("src", "?") for i in imgs if not (i.get("alt") or "").strip()]
    if no_alt:
        issues.append(f"{len(no_alt)} of {len(imgs)} images have no alt text")
    elif imgs:
        passed.append(f"All {len(imgs)} images have alt text")

    robots_meta = soup.find("meta", attrs={"name": re.compile("^robots$", re.I)})
    if robots_meta and "noindex" in (robots_meta.get("content") or "").lower():
        issues.append("Page is set to noindex (Google won't list it)")

    if not soup.find("html", attrs={"lang": True}):
        issues.append("<html> has no lang attribute")
    else:
        passed.append("lang attribute set")

    if not soup.find("meta", attrs={"name": re.compile("^viewport$", re.I)}):
        issues.append("No viewport meta tag (page may not be mobile-friendly)")
    else:
        passed.append("Viewport meta tag present")

    canonical = soup.find("link", rel="canonical")
    if canonical is None:
        issues.append("No canonical link tag")

    text = soup.get_text(" ", strip=True)
    words = len(text.split())
    if words < 300:
        issues.append(f"Thin content: about {words} words (aim for 300+ on content pages)")

    base_host = urlparse(url).netloc
    links = [urljoin(url, a["href"]) for a in soup.find_all("a", href=True)]
    internal = {_strip_fragment(l) for l in links if urlparse(l).netloc == base_host and urlparse(l).scheme in ("http", "https")}
    external = {l for l in links if urlparse(l).netloc and urlparse(l).netloc != base_host and urlparse(l).scheme in ("http", "https")}

    return {
        "url": url,
        "title": title,
        "title_length": len(title),
        "meta_description": desc,
        "h1_count": len(h1s),
        "word_count": words,
        "images": len(imgs),
        "images_missing_alt": len(no_alt),
        "internal_links": sorted(internal),
        "external_link_count": len(external),
        "issues": issues,
        "passed": passed,
    }


async def _fetch(client: httpx.AsyncClient, url: str) -> httpx.Response | None:
    try:
        return await client.get(url, follow_redirects=True)
    except httpx.HTTPError:
        return None


@mcp.tool()
async def audit_page(url: str) -> dict:
    """Run on-page SEO checks on one URL: title, meta description, headings,
    image alt text, noindex, lang, viewport, canonical, word count and links.
    Returns a list of issues and things that passed."""
    url = _normalize(url)
    async with httpx.AsyncClient(headers=HEADERS, timeout=TIMEOUT) as client:
        r = await _fetch(client, url)
    if r is None:
        return {"url": url, "error": "Could not reach the page"}
    if r.status_code >= 400:
        return {"url": url, "error": f"Page returned HTTP {r.status_code}"}
    result = _audit_html(str(r.url), r.text)
    result.pop("internal_links", None)
    return result


@mcp.tool()
async def audit_site(url: str, max_pages: int = 25) -> dict:
    """Crawl a site (same domain only) and check each page for SEO issues,
    broken internal links, robots.txt and sitemap.xml. max_pages is capped at 100."""
    start = _normalize(url)
    max_pages = max(1, min(max_pages, MAX_PAGES_CAP))
    origin = urlparse(start)
    base = f"{origin.scheme}://{origin.netloc}"

    findings = {"site": base, "robots_txt": None, "sitemap_xml": None, "pages": [], "broken_links": [], "crawl_limit": max_pages}

    async with httpx.AsyncClient(headers=HEADERS, timeout=TIMEOUT) as client:
        robots = await _fetch(client, base + "/robots.txt")
        findings["robots_txt"] = "found" if robots is not None and robots.status_code == 200 else "missing"
        sitemap = await _fetch(client, base + "/sitemap.xml")
        findings["sitemap_xml"] = "found" if sitemap is not None and sitemap.status_code == 200 else "missing"

        queue, seen, checked_links = deque([start]), {start}, {}
        while queue and len(findings["pages"]) < max_pages:
            page_url = queue.popleft()
            r = await _fetch(client, page_url)
            if r is None or r.status_code >= 400:
                findings["broken_links"].append({"url": page_url, "status": r.status_code if r is not None else "unreachable"})
                continue
            if "text/html" not in r.headers.get("content-type", ""):
                continue
            audit = _audit_html(str(r.url), r.text)
            for link in audit.pop("internal_links"):
                if link not in seen and len(seen) < MAX_PAGES_CAP * 5:
                    seen.add(link)
                    queue.append(link)
            findings["pages"].append(audit)

    # Summarise the most common issues across pages
    counts: dict[str, int] = {}
    for p in findings["pages"]:
        for issue in p["issues"]:
            key = re.sub(r"\d+", "N", issue)
            counts[key] = counts.get(key, 0) + 1
    findings["top_issues"] = sorted(counts.items(), key=lambda kv: -kv[1])[:10]
    findings["pages_checked"] = len(findings["pages"])
    return findings


@mcp.tool()
async def keyword_ideas(seed: str, country: str = "us", language: str = "en") -> dict:
    """Get keyword ideas for a seed phrase from Google's public autocomplete.
    Adds variations with a–z and common question words. Free, no key needed.
    Note: these show what people type, not search volume."""
    seed = seed.strip()
    if not seed:
        return {"error": "Give a seed keyword"}

    queries = [seed] + [f"{seed} {c}" for c in "abcdefghijklmnopqrstuvwxyz"]
    queries += [f"{w} {seed}" for w in ["how to", "best", "vs", "for", "near me", "price"]]

    results: set[str] = set()
    sem = asyncio.Semaphore(8)

    async def suggest(client: httpx.AsyncClient, q: str):
        async with sem:
            try:
                r = await client.get(
                    "https://suggestqueries.google.com/complete/search",
                    params={"client": "firefox", "q": q, "hl": language, "gl": country},
                )
                if r.status_code == 200:
                    for s in r.json()[1]:
                        results.add(s.lower())
            except (httpx.HTTPError, ValueError, IndexError):
                pass

    async with httpx.AsyncClient(headers=HEADERS, timeout=TIMEOUT) as client:
        await asyncio.gather(*(suggest(client, q) for q in queries))

    if not results:
        return {"seed": seed, "error": "No suggestions returned (Google may be rate-limiting or blocked here). Try again later."}

    ideas = sorted(results, key=lambda s: (len(s.split()), s))
    return {"seed": seed, "country": country, "count": len(ideas), "ideas": ideas[:300]}


if __name__ == "__main__":
    mcp.run()
