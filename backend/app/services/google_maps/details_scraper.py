import re
from typing import Optional

from playwright.async_api import Page


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
        # 'commit' returns as soon as navigation is committed. We then wait only
        # for the business heading instead of waiting for the full Maps page.
        await page.goto(url, wait_until="commit", timeout=7000)
        await page.locator("h1").first.wait_for(state="visible", timeout=2500)

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
            "google_maps": url,
        }

        try:
            business["name"] = clean_text(await page.locator("h1").first.inner_text(timeout=700))
        except Exception:
            pass

        try:
            stars = page.locator('span[role="img"]')
            for i in range(await stars.count()):
                aria = await stars.nth(i).get_attribute("aria-label", timeout=300)
                if aria and "star" in aria.lower():
                    match = re.search(r"([0-9.]+)", aria)
                    if match:
                        business["rating"] = float(match.group(1))
                    break
        except Exception:
            pass

        try:
            reviews = page.locator('button[jsaction*="pane.reviewChart"]')
            if await reviews.count():
                review_text = await reviews.first.inner_text(timeout=300)
                match = re.search(r"([\d,]+)", review_text)
                if match:
                    business["reviews"] = int(match.group(1).replace(",", ""))
        except Exception:
            pass

        try:
            category = page.locator('button[jsaction*="pane.rating.category"]')
            if await category.count():
                business["category"] = clean_text(await category.first.inner_text(timeout=300))
        except Exception:
            pass

        try:
            address = page.locator('button[data-item-id="address"]')
            if await address.count():
                business["address"] = clean_text(await address.first.inner_text(timeout=300))
        except Exception:
            pass

        try:
            phone = page.locator('button[data-item-id^="phone"]')
            if await phone.count():
                business["phone"] = clean_phone(await phone.first.inner_text(timeout=300))
        except Exception:
            pass

        try:
            website = page.locator('a[data-item-id="authority"]')
            if await website.count():
                href = await website.first.get_attribute("href", timeout=300)
                if href:
                    business["website"] = href.split("?")[0]
        except Exception:
            pass

        return business
