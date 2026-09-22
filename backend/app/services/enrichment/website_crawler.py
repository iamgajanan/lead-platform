"""Small, bounded website crawler used by lead enrichment."""

from __future__ import annotations

from collections.abc import Iterable
from urllib.parse import urljoin, urlparse

import httpx

from app.services.enrichment.email_extractor import extract_contact_data

DEFAULT_PATHS = ("/", "/contact", "/contact-us", "/about", "/about-us", "/team")


class WebsiteCrawler:
    def __init__(self, timeout: float = 15.0, max_pages: int = 6) -> None:
        self.timeout = timeout
        self.max_pages = max_pages

    async def enrich(self, website: str, paths: Iterable[str] = DEFAULT_PATHS) -> dict:
        if not website:
            return {"emails": [], "phones": [], "facebook": [], "instagram": [], "linkedin": [], "pages_crawled": []}

        base = website if website.startswith(("http://", "https://")) else f"https://{website}"
        parsed = urlparse(base)
        if not parsed.hostname:
            return {"emails": [], "phones": [], "facebook": [], "instagram": [], "linkedin": [], "pages_crawled": []}

        pages = []
        for path in paths:
            candidate = urljoin(base.rstrip("/") + "/", path.lstrip("/"))
            if urlparse(candidate).hostname == parsed.hostname and candidate not in pages:
                pages.append(candidate)
            if len(pages) >= self.max_pages:
                break

        result = {"emails": [], "phones": [], "facebook": [], "instagram": [], "linkedin": [], "pages_crawled": []}
        async with httpx.AsyncClient(follow_redirects=True, timeout=self.timeout, headers={"User-Agent": "LeadPlatformBot/1.0"}) as client:
            for url in pages:
                try:
                    response = await client.get(url)
                    response.raise_for_status()
                    if "text/html" not in response.headers.get("content-type", "").lower():
                        continue
                    data = extract_contact_data(response.text, str(response.url))
                    result["pages_crawled"].append(str(response.url))
                    for key in ("emails", "phones", "facebook", "instagram", "linkedin"):
                        result[key].extend(data[key])
                except (httpx.HTTPError, UnicodeError):
                    continue

        for key in ("emails", "phones", "facebook", "instagram", "linkedin"):
            result[key] = list(dict.fromkeys(result[key]))
        return result
