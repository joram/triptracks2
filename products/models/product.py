import dataclasses
import re
from typing import Optional


@dataclasses.dataclass
class Spec:
    key: str
    value: str


@dataclasses.dataclass
class Product:
    name: str
    description: str
    url: str
    price_cents: int
    img_hrefs: [str]
    specs: list[Spec]

    @property
    def slug(self):
        name = self.name
        name = name.lower()
        for c in [" ", "/", "(", ")", ",", "'", '"', "&", "’", "”", "“", "‘", "–", "—", "®", "™", "®", "™"]:
            name = name.replace(c, "-")
        while "--" in name:
            name = name.replace("--", "-")
        return name

    @property
    def weight(self) -> Optional[float]:
        for spec in self.specs:
            s = spec.key.lower()
            if "fabric" in s:
                continue
            if "weight" in s:
                # convert A-B to (A+B)/2
                if "-" in s:
                    regex = re.compile(r"(\d+)-(\d+)")
                    match = regex.search(s)
                    if match:
                        a = float(match.group(1))
                        b = float(match.group(2))
                        v = (a + b) / 2
                        s = regex.sub(s, f"{v}")
                if " pound" in s:
                    s = s.replace(" pound", "lb")

                def word_to_grams(word):
                    try:
                        word = word.replace(",", "")
                        if word.endswith("kg"):
                            word = word.replace("kg", "")
                            return float(word) * 1000
                        if word.endswith("g"):
                            word = word.replace("g", "")
                            return float(word)
                        if word.endswith("lb"):
                            word = word.replace("lb", "")
                            return float(word) * 453.592
                        if word.endswith("oz"):
                            word = word.replace("oz", "")
                            return float(word) * 28.3495
                    except ValueError:
                        pass
                    return 0

                grams = [word_to_grams(word) for word in spec.value.split(" ")]
                grams = sum(grams)
                grams = int(grams*100)/100
                if grams > 0:
                    return grams
        return None
