import re
from typing import Optional
from urllib.parse import urljoin

from playwright.async_api import Page


GOOGLE_MAPS_ORIGIN = "https://www.google.com"


def clean_text(value: Optional[str]) -> Optional[str]:
    if not value:
        return None

    value = value.replace("", "").replace("", "")
    value = value.replace("\n", " ").replace("\t", " ")
    value = re.sub(r"\s+", " ", value)
    return value.strip() or None


def clean_phone(value: Optional[str]) -> Optional[str]:
    if not value:
        return None

    value = value.replace("tel:", "")
    value = clean_text(value)
    if not value:
        return None

    value = re.sub(r"[^0-9+\-() ]", "", value)
    value = re.sub(r"\s+", " ", value).strip()
    digits = re.sub(r"\D", "", value)
    return value if len(digits) >= 7 else None


class GoogleMapsDetailsScraper:
    async def _first_text(self, page: Page, selectors: str, timeout: int = 900):
        locator = page.locator(selectors).first
        if await locator.count():
            try:
                return clean_text(await locator.inner_text(timeout=timeout))
            except Exception:
                return None
        return None

    async def _first_attribute(self, page: Page, selectors: str, attribute: str, timeout: int = 900):
        locator = page.locator(selectors).first
        if await locator.count():
            try:
                return await locator.get_attribute(attribute, timeout=timeout)
            except Exception:
                return None
        return None

    async def scrape(self, page: Page, url: str):
        absolute_url = urljoin(GOOGLE_MAPS_ORIGIN, url)
        await page.goto(absolute_url, wait_until="domcontentloaded", timeout=12000)

        # Do not wait for phone/website controls here. Some Google Maps pages
        # render those controls late or omit them, while the business heading
        # is available earlier. Failing this wait previously returned empty
        # fallback records for otherwise valid businesses.
        try:
            await page.locator("h1").first.wait_for(state="visible", timeout=5000)
        except Exception:
            pass

        await page.wait_for_timeout(900)

        business = {
            "name": await self._first_text(page, "h1"),
            "category": await self._first_text(
                page,
                "button[jsaction*='pane.rating.category'], button[jsaction*='category']",
            ),
            "rating": None,
            "reviews": None,
            "address": await self._first_text(
                page,
                "button[data-item-id='address'], [data-item-id='address']",
            ),
            "phone": None,
            "website": None,
            "email": None,
            "facebook": None,
            "instagram": None,
            "linkedin": None,
            "google_maps": absolute_url,
        }

        try:
            labels = page.locator("span[role='img'][aria-label]")
            for index in range(await labels.count()):
                aria = await labels.nth(index).get_attribute("aria-label", timeout=500)
                if aria and "star" in aria.lower():
                    match = re.search(r"([0-9]+(?:\.[0-9]+)?)", aria)
                    if match:
                        business["rating"] = float(match.group(1))
                    break
        except Exception:
            pass

        review_text = await self._first_text(
            page,
            "button[jsaction*='pane.reviewChart'], span[aria-label*='reviews']",
            timeout=700,
        )
        if review_text:
            match = re.search(r"([\d,]+)", review_text)
            if match:
                business["reviews"] = int(match.group(1).replace(",", ""))

        phone_text = await self._first_text(
            page,
            "button[data-item-id^='phone'], [data-item-id^='phone']",
        )
        if not phone_text:
            phone_text = await self._first_attribute(
                page,
                "button[data-item-id^='phone'], [data-item-id^='phone']",
                "aria-label",
            )
        if not phone_text:
            phone_text = await self._first_attribute(page, "a[href^='tel:']", "href")
        business["phone"] = clean_phone(phone_text)

        website_href = await self._first_attribute(
            page,
            "a[data-item-id='authority'], a[aria-label*='Website'], a[href^='http'][target='_blank']",
            "href",
        )
        if website_href:
            website = urljoin(absolute_url, website_href).split("?")[0]
            if "google.com" not in website.lower() or "maps" not in website.lower():
                business["website"] = website

        return business
