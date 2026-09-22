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

            # Google Maps sometimes stops loading new results before the
            # requested limit. Stop after several unchanged scrolls.
            if stable_rounds >= 4:
                break

        return await page.content()

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
            crawler = WebsiteCrawler() if enrich else None
            businesses = []

            print(f"Discovered {len(results)} Google Maps results")

            for index, result in enumerate(results, start=1):
                print(f"Scraping {index}/{len(results)} -> {result['name']}")
                details = await detail_scraper.scrape(page, result["url"])

                if crawler and details.get("website"):
                    enrichment = await crawler.enrich(details["website"])
                    details["emails"] = enrichment["emails"]
                    details["phones_from_website"] = enrichment["phones"]
                    details["facebook"] = enrichment["facebook"]
                    details["instagram"] = enrichment["instagram"]
                    details["linkedin"] = enrichment["linkedin"]
                    details["enrichment_pages"] = enrichment["pages_crawled"]
                elif crawler:
                    details.update(
                        {
                            "emails": [],
                            "phones_from_website": [],
                            "facebook": [],
                            "instagram": [],
                            "linkedin": [],
                            "enrichment_pages": [],
                        }
                    )

                businesses.append(details)

            return {
                "success": True,
                "count": len(businesses),
                "enriched": enrich,
                "results": businesses,
            }
        finally:
            await browser.close()
