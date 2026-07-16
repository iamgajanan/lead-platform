from bs4 import BeautifulSoup


class GoogleMapsHTMLParser:

    def parse(self, html: str):

        soup = BeautifulSoup(html, "lxml")

        results = []

        for link in soup.find_all("a", href=True):

            href = link["href"]

            if "/maps/place/" not in href:
                continue

            name = link.get_text(" ", strip=True)

            if not name:
                continue

            results.append(
                {
                    "name": name,
                    "url": href,
                }
            )

        # Remove duplicates

        unique = {}

        for item in results:
            unique[item["url"]] = item

        return list(unique.values())