from pathlib import Path
from urllib.parse import quote

from app.services.google_maps.browser import GoogleMapsBrowser
from app.services.google_maps.html_parser import GoogleMapsHTMLParser
from app.services.google_maps.details_scraper import GoogleMapsDetailsScraper


class GoogleMapsScraper:

    async def search(self, keyword: str, location: str):

        browser = GoogleMapsBrowser()

        await browser.start()

        try:
            page = await browser.new_page()

            query = quote(f"{keyword} {location}")

            search_url = f"https://www.google.com/maps/search/{query}"

            print(f"Searching : {search_url}")

            await page.goto(
                search_url,
                wait_until="domcontentloaded",
                timeout=60000,
            )

            await page.wait_for_selector("h1", timeout=15000)
            html = await page.content()

            Path("google_maps.html").write_text(
                html,
                encoding="utf-8",
            )

            parser = GoogleMapsHTMLParser()

            results = parser.parse(html)

            print(f"Found {len(results)} businesses")

            detail_scraper = GoogleMapsDetailsScraper()

            businesses = []

            for result in results:

                print(f"Scraping -> {result['name']}")

                details = await detail_scraper.scrape(
                    page,
                    result["url"],
                )

                businesses.append(details)

            return {
                "success": True,
                "count": len(businesses),
                "results": businesses,
            }

        finally:
            await browser.close()