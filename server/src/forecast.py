import datetime
import pprint
from typing import Optional, List

import requests
from bs4 import BeautifulSoup
from env_canada import ECWeather
from pydantic import BaseModel

from .app import app


class Value(BaseModel):
    value: Optional[float]
    unit: str
    label: str


class UnitlessStringValue(BaseModel):
    value: Optional[str]
    label: str


class ListOfStrings(BaseModel):
    value: List[str]
    label: str


class UnitlessValue(BaseModel):
    value: Optional[float]
    label: str


class CurrentConditions(BaseModel):
    temperature: Value
    dewpoint: Value
    wind_chill: UnitlessValue
    humidex: UnitlessValue
    pressure: Value
    tendency: UnitlessStringValue
    humidity: Value
    visibility: Value  # {'label': 'Visibility', 'value': 48.3, 'unit': 'km'},
    condition: UnitlessStringValue  # {'label': 'Condition', 'value': 'Mostly Cloudy'},
    wind_speed: Value  # {'label': 'Wind Speed', 'value': 3, 'unit': 'km/h'},
    wind_gust: UnitlessValue  # {'label': 'Wind Gust', 'value': None},
    wind_dir: UnitlessStringValue # 'wind_dir': {'label': 'Wind Direction', 'value': 'W'},
    wind_bearing: Value  # {'label': 'Wind Bearing', 'value': 274, 'unit': 'degrees'},
    high_temp: Value  # {'label': 'High Temperature', 'value': 7, 'unit': 'C'},
    low_temp: Value  # {'label': 'Low Temperature', 'value': 1, 'unit': 'C'},
    uv_index: UnitlessValue  # 'uv_index': {'label': 'UV Index', 'value': 2},
    pop: UnitlessValue  # {'label': 'Chance of Precip.', 'value': None},
    icon_code: UnitlessValue  # {'label': 'Icon Code', 'value': '33'},
    precip_yesterday: Value  # {'label': 'Precipitation Yesterday', 'value': 0.3, 'unit': 'mm'},
    normal_high: Value  # {'label': 'Normal High Temperature', 'value': 8, 'unit': 'C'},
    normal_low: Value  # {'label': 'Normal Low Temperature', 'value': 2, 'unit': 'C'},
    text_summary: UnitlessStringValue  # {'label': 'Forecast', 'value': 'Tonight. Mainly cloudy...'}}


class Alerts(BaseModel):
    advisories: ListOfStrings
    endings: ListOfStrings
    statements: ListOfStrings
    warnings: ListOfStrings
    watches: ListOfStrings


class DailyForecast(BaseModel):
    icon_code: str
    period: str
    precip_probability: float
    temperature: float
    temperature_class: str
    text_summary: str


class HourlyForecast(BaseModel):
    condition: str
    icon_code: str
    period: datetime.datetime
    precip_probability: float
    temperature: float


class Weather(BaseModel):
    current_conditions: CurrentConditions
    daily_forecasts: List[DailyForecast]
    hourly_forecasts: List[HourlyForecast]
    alerts: Alerts
    # [{'period': 'Saturday night',
    #   'text_summary': 'Mainly cloudy. Clearing before morning. Fog patches developing after midnight. Low plus 1 except plus 4 near the water.',
    #   'icon_code': '33', 'temperature': 1, 'temperature_class': 'low', 'precip_probability': 0}, {'period': 'Sunday',
    #                                                                                               'text_summary': 'A mix of sun and cloud. Fog patches dissipating in the morning. High 7. UV index 2 or low.',
    #                                                                                               'icon_code': '02',
    #                                                                                               'temperature': 7,
    #                                                                                               'temperature_class': 'high',
    #                                                                                               'precip_probability': 0},
    #  {'period': 'Sunday night', 'text_summary': 'Mainly cloudy. A few showers beginning after midnight. Low plus 3.',
    #   'icon_code': '12', 'temperature': 3, 'temperature_class': 'low', 'precip_probability': 0},
    #  {'period': 'Monday', 'text_summary': 'Showers. High 10.', 'icon_code': '12', 'temperature': 10,
    #   'temperature_class': 'high', 'precip_probability': 0},
    #  {'period': 'Monday night', 'text_summary': 'Cloudy periods. Low plus 1.', 'icon_code': '32', 'temperature': 1,
    #   'temperature_class': 'low', 'precip_probability': 0},
    #  {'period': 'Tuesday', 'text_summary': 'A mix of sun and cloud. High 9.', 'icon_code': '02', 'temperature': 9,
    #   'temperature_class': 'high', 'precip_probability': 0},
    #  {'period': 'Tuesday night', 'text_summary': 'Cloudy with 60 percent chance of showers. Low plus 4.',
    #   'icon_code': '12', 'temperature': 4, 'temperature_class': 'low', 'precip_probability': 60},
    #  {'period': 'Wednesday', 'text_summary': 'A mix of sun and cloud. High 8.', 'icon_code': '02', 'temperature': 8,
    #   'temperature_class': 'high', 'precip_probability': 0},
    #  {'period': 'Wednesday night', 'text_summary': 'Cloudy periods. Low plus 3.', 'icon_code': '32', 'temperature': 3,
    #   'temperature_class': 'low', 'precip_probability': 0},
    #  {'period': 'Thursday', 'text_summary': 'A mix of sun and cloud. High 11.', 'icon_code': '02', 'temperature': 11,
    #   'temperature_class': 'high', 'precip_probability': 0},
    #  {'period': 'Thursday night', 'text_summary': 'Cloudy periods. Low plus 3.', 'icon_code': '32', 'temperature': 3,
    #   'temperature_class': 'low', 'precip_probability': 0},
    #  {'period': 'Friday', 'text_summary': 'A mix of sun and cloud. High 13.', 'icon_code': '02', 'temperature': 13,
    #   'temperature_class': 'high', 'precip_probability': 0}]
    # [{'period': datetime.datetime(2022, 2, 6, 5, 0, tzinfo=tzutc()), 'condition': 'Mainly cloudy', 'temperature': 4,
    #   'icon_code': '33', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 6, 0, tzinfo=tzutc()), 'condition': 'Mainly cloudy', 'temperature': 3,
    #   'icon_code': '33', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 7, 0, tzinfo=tzutc()), 'condition': 'Mainly cloudy', 'temperature': 3,
    #   'icon_code': '33', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 8, 0, tzinfo=tzutc()), 'condition': 'Mainly cloudy', 'temperature': 2,
    #   'icon_code': '33', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 9, 0, tzinfo=tzutc()), 'condition': 'Mainly cloudy', 'temperature': 2,
    #   'icon_code': '33', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 10, 0, tzinfo=tzutc()), 'condition': 'Mainly cloudy', 'temperature': 2,
    #   'icon_code': '33', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 11, 0, tzinfo=tzutc()), 'condition': 'Mainly cloudy', 'temperature': 1,
    #   'icon_code': '33', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 12, 0, tzinfo=tzutc()), 'condition': 'Partly cloudy', 'temperature': 1,
    #   'icon_code': '32', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 13, 0, tzinfo=tzutc()), 'condition': 'Partly cloudy', 'temperature': 2,
    #   'icon_code': '32', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 14, 0, tzinfo=tzutc()), 'condition': 'Partly cloudy', 'temperature': 2,
    #   'icon_code': '32', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 15, 0, tzinfo=tzutc()), 'condition': 'Partly cloudy', 'temperature': 3,
    #   'icon_code': '32', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 16, 0, tzinfo=tzutc()), 'condition': 'A mix of sun and cloud',
    #   'temperature': 4, 'icon_code': '02', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 17, 0, tzinfo=tzutc()), 'condition': 'A mix of sun and cloud',
    #   'temperature': 5, 'icon_code': '02', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 18, 0, tzinfo=tzutc()), 'condition': 'A mix of sun and cloud',
    #   'temperature': 6, 'icon_code': '02', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 19, 0, tzinfo=tzutc()), 'condition': 'A mix of sun and cloud',
    #   'temperature': 6, 'icon_code': '02', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 20, 0, tzinfo=tzutc()), 'condition': 'A mix of sun and cloud',
    #   'temperature': 7, 'icon_code': '02', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 21, 0, tzinfo=tzutc()), 'condition': 'A mix of sun and cloud',
    #   'temperature': 7, 'icon_code': '02', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 22, 0, tzinfo=tzutc()), 'condition': 'A mix of sun and cloud',
    #   'temperature': 7, 'icon_code': '02', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 6, 23, 0, tzinfo=tzutc()), 'condition': 'A mix of sun and cloud',
    #   'temperature': 7, 'icon_code': '02', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 7, 0, 0, tzinfo=tzutc()), 'condition': 'A mix of sun and cloud',
    #   'temperature': 7, 'icon_code': '02', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 7, 1, 0, tzinfo=tzutc()), 'condition': 'Partly cloudy', 'temperature': 7,
    #   'icon_code': '32', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 7, 2, 0, tzinfo=tzutc()), 'condition': 'Partly cloudy', 'temperature': 6,
    #   'icon_code': '32', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 7, 3, 0, tzinfo=tzutc()), 'condition': 'Partly cloudy', 'temperature': 6,
    #   'icon_code': '32', 'precip_probability': 0},
    #  {'period': datetime.datetime(2022, 2, 7, 4, 0, tzinfo=tzutc()), 'condition': 'Mainly cloudy', 'temperature': 6,
    #   'icon_code': '33', 'precip_probability': 0}]
    # {'warnings': {'value': [], 'label': 'Warnings'}, 'watches': {'value': [], 'label': 'Watches'},
    #  'advisories': {'value': [], 'label': 'Advisories'}, 'statements': {'value': [], 'label': 'Statements'},
    #  'endings': {'value': [], 'label': 'Endings'}}


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
                AvalancheForecastLayer(date=date1, alpine_rating=alpine_rating1, treeline_rating=treeline_rating1, below_treeline_rating=below_treeline_rating1),
                AvalancheForecastLayer(date=date2, alpine_rating=alpine_rating2, treeline_rating=treeline_rating2, below_treeline_rating=below_treeline_rating2),
                AvalancheForecastLayer(date=date3, alpine_rating=alpine_rating3, treeline_rating=treeline_rating3, below_treeline_rating=below_treeline_rating3),
            ],
            confidence=confidence,
            advice=advice,
        )


class Forecast(BaseModel):
    avalanche: Avalanche
    weather: Weather


@app.get("/api/v0/forecast", response_model=Forecast)
async def forecast(
        # user: User = Depends(verify_access_key),
        start: str = "2022-2-10",
        end: str = "2022-2-12",
        lat: float = 48.4284,
        lng: float = -123.3656,
):
    url = "https://www.avalanche.ca/api/forecasts/sea-to-sky.html"
    response = requests.get(url)

    ec_en = ECWeather(coordinates=(lat, lng))
    await ec_en.update()

    return Forecast(
        weather=Weather(
            current_conditions=ec_en.conditions,
            daily_forecasts=ec_en.daily_forecasts,
            hourly_forecasts=ec_en.hourly_forecasts,
            alerts=ec_en.alerts
        ),
        avalanche=Avalanche.from_html(response.text),
    )
