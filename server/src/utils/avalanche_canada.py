from typing import List

from bs4 import BeautifulSoup
from pydantic import BaseModel
import requests

class AvalancheForecastLayer(BaseModel):
    date: str
    alpine_rating: str
    treeline_rating: str
    below_treeline_rating: str


class Avalanche(BaseModel):
    # raw: str
    title: str
    date_issued: str
    valid_until: str
    forecaster: str
    summary: str
    layers: List[AvalancheForecastLayer]
    confidence: str
    advice: List[str]

    @classmethod
    def from_html(cls, html):
        soup = BeautifulSoup(html, 'html.parser')

        header = soup.find("header")
        header_ps = header.find_all("p")
        date_issued_title = header_ps[0].find("b").text.strip(" \n")
        date_issued_value = header_ps[0].find("time").attrs["datetime"]
        valid_until_title = header_ps[1].find("b").text.strip(" \n")
        valid_until_value = header_ps[1].find("time").attrs["datetime"]
        forecaster_title = header_ps[2].find("b").text.strip(" \n")
        forecaster_value = header_ps[2].text.replace("Forecaster:", "").strip(" \n")
        assert len(header_ps) == 3
        assert date_issued_title == "Date Issued:"
        assert valid_until_title == "Valid Until:"
        assert forecaster_title == "Forecaster:"

        summary = soup.find("section").find("p").find("p").text.strip(" \n")

        table = soup.find("table")
        thead = table.find("thead")
        ths = thead.find_all("th")
        assert len(ths) == 4
        date1 = ths[1].text.strip(" \n")
        date2 = ths[2].text.strip(" \n")
        date3 = ths[3].text.strip(" \n")
        trs = thead.find_all("tr")
        assert len(trs) == 4
        tds_alpine = trs[1].find_all("td")
        print(len(tds_alpine))
        assert len(tds_alpine) == 4
        alpine_rating1 = tds_alpine[1].text.strip(" \n")
        alpine_rating2 = tds_alpine[2].text.strip(" \n")
        alpine_rating3 = tds_alpine[3].text.strip(" \n")
        tds_treeline = trs[2].find_all("td")
        assert len(tds_treeline) == 4
        treeline_rating1 = tds_treeline[1].text.strip(" \n")
        treeline_rating2 = tds_treeline[2].text.strip(" \n")
        treeline_rating3 = tds_treeline[3].text.strip(" \n")
        tds_below_treeline = trs[3].find_all("td")
        assert len(tds_below_treeline) == 4
        below_treeline_rating1 = tds_below_treeline[1].text.strip(" \n")
        below_treeline_rating2 = tds_below_treeline[2].text.strip(" \n")
        below_treeline_rating3 = tds_below_treeline[3].text.strip(" \n")
        confidence = soup.find("caption").text.replace("Confidence:", "").strip(" \n")
        advice_lis = soup.find_all("li")
        advice = [li.text.strip(" \n") for li in advice_lis]
        return Avalanche(
            title=header.find("h1").text.strip(" \n"),
            date_issued=date_issued_value,
            valid_until=valid_until_value,
            forecaster=forecaster_value,
            summary=summary,
            layers=[
                AvalancheForecastLayer(date=date1, alpine_rating=alpine_rating1, treeline_rating=treeline_rating1,
                                       below_treeline_rating=below_treeline_rating1),
                AvalancheForecastLayer(date=date2, alpine_rating=alpine_rating2, treeline_rating=treeline_rating2,
                                       below_treeline_rating=below_treeline_rating2),
                AvalancheForecastLayer(date=date3, alpine_rating=alpine_rating3, treeline_rating=treeline_rating3,
                                       below_treeline_rating=below_treeline_rating3),
            ],
            confidence=confidence,
            advice=advice,
        )


def get_avalanche_forecast(lat,lng):
    url = "https://www.avalanche.ca/api/forecasts/sea-to-sky.html"
    response = requests.get(url)
    return Avalanche.from_html(response.text)
