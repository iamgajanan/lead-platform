"""Extract and normalize contact data from website HTML."""

from __future__ import annotations

import re
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup

EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)
PHONE_RE = re.compile(
    r"(?<!\w)(?:\+?(?:91[\s-]?)?[6-9]\d{9}|\+?\d[\d\s().-]{8,}\d)(?!\w)"
)
SOCIAL_HOSTS = {
    "facebook.com": "facebook",
    "www.facebook.com": "facebook",
    "instagram.com": "instagram",
    "www.instagram.com": "instagram",
    "linkedin.com": "linkedin",
    "www.linkedin.com": "linkedin",
}


def _unique(values: list[str]) -> list[str]:
    return list(dict.fromkeys(value for value in values if value))


def _normalize_phone(value: str) -> str | None:
    cleaned = re.sub(r"\s+", " ", value or "").strip()
    if not cleaned or "%" in cleaned or "/" in cleaned:
        return None

    digits = re.sub(r"\D", "", cleaned)
    if len(digits) < 8 or len(digits) > 15:
        return None

    return cleaned


def extract_contact_data(html: str, base_url: str) -> dict[str, list[str]]:
    """Extract emails, phone numbers and social URLs from HTML."""
    soup = BeautifulSoup(html or "", "html.parser")

    text = soup.get_text(" ", strip=True)
    text = re.sub(r"https?://\S+", " ", text)
    emails = EMAIL_RE.findall(text)
    phones = [
        normalized
        for value in PHONE_RE.findall(text)
        if (normalized := _normalize_phone(value))
    ]
    socials: dict[str, list[str]] = {key: [] for key in SOCIAL_HOSTS.values()}

    for anchor in soup.select("a[href]"):
        href = urljoin(base_url, anchor.get("href", "").strip())
        parsed = urlparse(href)
        host = (parsed.hostname or "").lower()

        if host in SOCIAL_HOSTS:
            socials[SOCIAL_HOSTS[host]].append(href.split("?")[0].rstrip("/"))

        if href.lower().startswith("mailto:"):
            emails.append(href[7:].split("?", 1)[0])
        elif href.lower().startswith("tel:"):
            normalized = _normalize_phone(href[4:])
            if normalized:
                phones.append(normalized)

    return {
        "emails": _unique([email.lower() for email in emails]),
        "phones": _unique(phones),
        "facebook": _unique(socials["facebook"]),
        "instagram": _unique(socials["instagram"]),
        "linkedin": _unique(socials["linkedin"]),
    }
