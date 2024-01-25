import json
from typing import Optional

from bs4 import BeautifulSoup

from products.models.product import Product, Spec


def parse(soup: BeautifulSoup) -> Optional[Product]:
    key = "application/ld+json"
    scripts = soup.find_all("script", {"type": key})
    if not scripts:
        return None
    for script in scripts:
        data = script.string
        if not data:
            continue
        data = data.strip()
        if not data:
            continue

        data = json.loads(data)

        def _get_price_cents():
            if "offers" in data:
                offers = data["offers"]
                if "price" in offers:
                    price = offers["price"]
                    if "priceCurrency" in offers:
                        currency = offers["priceCurrency"]
                        if currency == "CAD":
                            return int(float(price) * 100)
            if "hasVariant" in data:
                variants = data["hasVariant"]
                for variant in variants:
                    if "offers" in variant:
                        offers = variant["offers"]
                        if "price" in offers:
                            price = offers["price"]
                            return int(float(price) * 100)

        if "Product" in data["@type"]:
            return Product(
                name=data["name"],
                description=data["description"],
                url=data["url"],
                img_hrefs=data["image"],
                price_cents=_get_price_cents(),
                specs=[],
            )
