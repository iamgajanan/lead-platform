import asyncio
from pathlib import Path
from urllib.parse import quote

from app.services.enrichment.website_crawler import WebsiteCrawler
from app.services.google_maps.browser import GoogleMapsBrowser
from app.services.google_maps.html_parser import GoogleMapsHTMLParser
from app.services.google_maps.details_scraper import GoogleMapsDetailsScraper


class GoogleMapsScraper:
    MAX_RESULTS = 100
    MAX_SCROLLS = 40
    SCROLL_WAIT_MS = 1200
    MAX_ENRICHED_RESULTS = 25
    ENRICHMENT_CONCURRENCY = 8

    async def _load_search_results(self, page):
        parser = GoogleMapsHTMLParser()
        feed = page.locator('div[role="feed"]').first
        previous_count = 0
        stable_rounds = 0

        for _ in range(self.MAX_SCROLLS):
            html = await page.content()
            current_count = len(parser.parse(html))

            if current_count >= self.MAX_RESULTS:
                break

            if await feed.count():
                await feed.evaluate(
                    "element => { element.scrollTop = element.scrollHeight; }"
                )
            else:
                await page.mouse.wheel(0, 5000)

            await page.wait_for_timeout(self.SCROLL_WAIT_MS)
            updated_html = await page.content()
            updated_count = len(parser.parse(updated_html))

            if updated_count == previous_count:
                stable_rounds += 1
            else:
                stable_rounds = 0

            previous_count = updated_count

            if stable_rounds >= 4:
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

    async def _enrich_business(
        self,
        business: dict,
        crawler: WebsiteCrawler,
        semaphore: asyncio.Semaphore,
    ) -> dict:
        if not business.get("website"):
            return self._empty_enrichment()

        async with semaphore:
            try:
                enrichment = await asyncio.wait_for(
                    crawler.enrich(business["website"]),
                    timeout=15,
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
            await page.goto(search_url, wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_selector("h1", timeout=15000)

            html = await self._load_search_results(page)
            Path("google_maps.html").write_text(html, encoding="utf-8")

            results = GoogleMapsHTMLParser().parse(html)[: self.MAX_RESULTS]
            detail_scraper = GoogleMapsDetailsScraper()
            businesses = []

            print(f"Discovered {len(results)} Google Maps results")

            for index, result in enumerate(results, start=1):
                print(f"Scraping {index}/{len(results)} -> {result['name']}")
                details = await detail_scraper.scrape(page, result["url"])
                businesses.append(details)

            if enrich:
                crawler = WebsiteCrawler(timeout=5.0, max_pages=3)
                semaphore = asyncio.Semaphore(self.ENRICHMENT_CONCURRENCY)
                enrichment_targets = businesses[: self.MAX_ENRICHED_RESULTS]
                enrichment_results = await asyncio.gather(
                    *(
                        self._enrich_business(business, crawler, semaphore)
                        for business in enrichment_targets
                    )
                )

                for business, enrichment in zip(enrichment_targets, enrichment_results):
                    business.update(enrichment)

                for business in businesses[self.MAX_ENRICHED_RESULTS :]:
                    business.update(self._empty_enrichment())

            return {
                "success": True,
                "count": len(businesses),
                "enriched": enrich,
                "enrichment_limit": self.MAX_ENRICHED_RESULTS if enrich else 0,
                "results": businesses,
            }
        finally:
            await browser.close()
