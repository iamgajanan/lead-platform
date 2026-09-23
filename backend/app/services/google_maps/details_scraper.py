import re
from typing import Optional
from urllib.parse import urljoin

from playwright.async_api import Page


GOOGLE_MAPS_ORIGIN = "https://www.google.com"


def clean_text(value: Optional[str]) -> Optional[str]:
    if not value:
        return None

    value = value.replace("", "")
    value = value.replace("", "")
    value = value.replace("\n", " ")
    value = value.replace("\t", " ")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def clean_phone(value: Optional[str]) -> Optional[str]:
    if not value:
        return None

    value = clean_text(value)
    value = re.sub(r"[^0-9+\-\(\) ]", "", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


class GoogleMapsDetailsScraper:
    async def scrape(self, page: Page, url: str):
        absolute_url = urljoin(GOOGLE_MAPS_ORIGIN, url)
        await page.goto(absolute_url, wait_until="domcontentloaded", timeout=12000)

        # Google Maps renders business controls asynchronously. Wait for the
        # page shell or one of the detail controls instead of relying only on h1.
        await page.locator(
            "h1, button[data-item-id='address'], button[data-item-id^='phone'], a[data-item-id='authority']"
        ).first.wait_for(state="visible", timeout=8000)

        business = {
            "name": None,
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
            "google_maps": absolute_url,
        }

        try:
            heading = page.locator("h1").first
            if await heading.count():
                business["name"] = clean_text(await heading.inner_text(timeout=1500))
        except Exception:
            pass

        try:
            stars = page.locator('span[role="img"]')
            for i in range(await stars.count()):
                aria = await stars.nth(i).get_attribute("aria-label", timeout=500)
                if aria and "star" in aria.lower():
                    match = re.search(r"([0-9.]+)", aria)
                    if match:
                        business["rating"] = float(match.group(1))
                    break
        except Exception:
            pass

        try:
            reviews = page.locator('button[jsaction*="pane.reviewChart"], span[aria-label*="reviews"]')
            if await reviews.count():
                review_text = await reviews.first.inner_text(timeout=700)
                match = re.search(r"([\d,]+)", review_text)
                if match:
                    business["reviews"] = int(match.group(1).replace(",", ""))
        except Exception:
            pass

        try:
            category = page.locator('button[jsaction*="pane.rating.category"], button[jsaction*="category"]')
            if await category.count():
                business["category"] = clean_text(await category.first.inner_text(timeout=700))
        except Exception:
            pass

        try:
            address = page.locator('[data-item-id="address"]')
            if await address.count():
                business["address"] = clean_text(await address.first.inner_text(timeout=700))
        except Exception:
            pass

        try:
            phone = page.locator('[data-item-id^="phone"]')
            if await phone.count():
                text = await phone.first.inner_text(timeout=700)
                business["phone"] = clean_phone(text)
            if not business["phone"]:
                tel_link = page.locator('a[href^="tel:"]')
                if await tel_link.count():
                    business["phone"] = clean_phone(await tel_link.first.get_attribute("href", timeout=700))
        except Exception:
            pass

        try:
            website = page.locator('a[data-item-id="authority"], a[aria-label*="Website"]')
            if await website.count():
                href = await website.first.get_attribute("href", timeout=700)
                if href:
                    business["website"] = urljoin(absolute_url, href).split("?")[0]
        except Exception:
            pass

        return business
