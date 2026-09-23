import asyncio
from pathlib import Path
from urllib.parse import quote, urljoin

from app.services.enrichment.website_crawler import WebsiteCrawler
from app.services.google_maps.browser import GoogleMapsBrowser
from app.services.google_maps.html_parser import GoogleMapsHTMLParser
from app.services.google_maps.details_scraper import GoogleMapsDetailsScraper


class GoogleMapsScraper:
    MAX_RESULTS = 60
    MAX_SCROLLS = 18
    SCROLL_WAIT_MS = 350
    STABLE_ROUNDS_LIMIT = 2
    DETAIL_CONCURRENCY = 16
    DETAIL_TIMEOUT_SECONDS = 10
    MAX_ENRICHED_RESULTS = 10
    ENRICHMENT_CONCURRENCY = 6
    ENRICHMENT_TIMEOUT_SECONDS = 5

    GOOGLE_MAPS_ORIGIN = "https://www.google.com"

    async def _load_search_results(self, page):
        parser = GoogleMapsHTMLParser()
        feed = page.locator('div[role="feed"]').first
        previous_count = -1
        stable_rounds = 0

        for _ in range(self.MAX_SCROLLS):
            html = await page.content()
            current_count = len(parser.parse(html))
            if current_count >= self.MAX_RESULTS:
                break

            if await feed.count():
                await feed.evaluate("element => { element.scrollTop = element.scrollHeight; }")
            else:
                await page.mouse.wheel(0, 5000)

            await page.wait_for_timeout(self.SCROLL_WAIT_MS)
            updated_count = len(parser.parse(await page.content()))

            if updated_count == previous_count:
                stable_rounds += 1
            else:
                stable_rounds = 0

            previous_count = updated_count
            if stable_rounds >= self.STABLE_ROUNDS_LIMIT:
                break

        return await page.content()

    @staticmethod
    def _empty_enrichment() -> dict:
        return {
            "emails": [],
            "phones_from_website": [],
            "facebook": [],
            "instagram": [],
            "linkedin": [],
            "enrichment_pages": [],
        }

    @staticmethod
    def _fallback_business(result: dict) -> dict:
        return {
            "name": result.get("name"),
            "category": None,
            "rating": None,
            "reviews": None,
            "address": None,
            "phone": None,
            "website": None,
            "email": None,
            "facebook": None,
            "instagram": None,
            "linkedin": None,
            "google_maps": result.get("url"),
        }

    def _absolute_maps_url(self, url: str) -> str:
        return urljoin(self.GOOGLE_MAPS_ORIGIN, url)

    async def _scrape_business(self, browser, result: dict, semaphore: asyncio.Semaphore) -> dict:
        async with semaphore:
            page = await browser.new_page()
            maps_url = self._absolute_maps_url(result["url"])
            try:
                return await asyncio.wait_for(
                    GoogleMapsDetailsScraper().scrape(page, maps_url),
                    timeout=self.DETAIL_TIMEOUT_SECONDS,
                )
            except Exception as exc:
                print(f"Details skipped for {result.get('name')} ({maps_url}): {exc}")
                fallback = self._fallback_business(result)
                fallback["google_maps"] = maps_url
                return fallback
            finally:
                await page.close()

    async def _enrich_business(self, business: dict, crawler: WebsiteCrawler, semaphore: asyncio.Semaphore) -> dict:
        if not business.get("website"):
            return self._empty_enrichment()

        async with semaphore:
            try:
                enrichment = await asyncio.wait_for(
                    crawler.enrich(business["website"]),
                    timeout=self.ENRICHMENT_TIMEOUT_SECONDS,
                )
                return {
                    "emails": enrichment["emails"],
                    "phones_from_website": enrichment["phones"],
                    "facebook": enrichment["facebook"],
                    "instagram": enrichment["instagram"],
                    "linkedin": enrichment["linkedin"],
                    "enrichment_pages": enrichment["pages_crawled"],
                }
            except Exception as exc:
                print(f"Enrichment skipped for {business.get('website')}: {exc}")
                return self._empty_enrichment()

    async def search(self, keyword: str, location: str, enrich: bool = False):
        browser = GoogleMapsBrowser()
        await browser.start()

        try:
            page = await browser.new_page()
            query = quote(f"{keyword} {location}")
            search_url = f"https://www.google.com/maps/search/{query}"
            print(f"Searching : {search_url}")
            await page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_selector("h1", timeout=10000)

            html = await self._load_search_results(page)
            Path("google_maps.html").write_text(html, encoding="utf-8")
            results = GoogleMapsHTMLParser().parse(html)[: self.MAX_RESULTS]
            await page.close()

            print(f"Discovered {len(results)} Google Maps results")
            detail_semaphore = asyncio.Semaphore(self.DETAIL_CONCURRENCY)
            businesses = await asyncio.gather(
                *(self._scrape_business(browser, result, detail_semaphore) for result in results)
            )

            if enrich:
                crawler = WebsiteCrawler(timeout=3.0, max_pages=2)
                enrichment_semaphore = asyncio.Semaphore(self.ENRICHMENT_CONCURRENCY)
                enrichment_targets = [
                    business for business in businesses[: self.MAX_ENRICHED_RESULTS]
                    if business.get("website")
                ]
                enrichment_results = await asyncio.gather(
                    *(self._enrich_business(business, crawler, enrichment_semaphore) for business in enrichment_targets)
                )

                for business, enrichment in zip(enrichment_targets, enrichment_results):
                    business.update(enrichment)

                for business in businesses:
                    for key, value in self._empty_enrichment().items():
                        business.setdefault(key, value)

            return {
                "success": True,
                "count": len(businesses),
                "enriched": enrich,
                "enrichment_limit": self.MAX_ENRICHED_RESULTS if enrich else 0,
                "results": businesses,
            }
        finally:
            await browser.close()
