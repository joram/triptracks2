import os
from typing import List

import dotenv
import requests
from pydantic import BaseModel


class HourForecast(BaseModel):
    class Condition(BaseModel):
        code: int
        icon: str
        text: str

    chance_of_rain: int
    chance_of_snow: int
    cloud: int
    condition: Condition
    dewpoint_c: float
    dewpoint_f: float
    diff_rad: float
    feelslike_c: float
    feelslike_f: float
    gust_kph: float
    gust_mph: float
    heatindex_c: float
    heatindex_f: float
    humidity: int
    is_day: int
    precip_in: float
    precip_mm: float
    pressure_in: float
    pressure_mb: float
    short_rad: float
    snow_cm: float
    temp_c: float
    temp_f: float
    time: str
    time_epoch: int
    uv: float
    vis_km: float
    vis_miles: float
    will_it_rain: int
    will_it_snow: int

    wind_degree: int
    wind_dir: str


class ForecastDay(BaseModel):
    astro: dict
    date: str
    date_epoch: int
    day: dict
    hour: List[HourForecast]


class Location(BaseModel):
    country: str
    lat: float
    lon: float
    tz_id: str
    localtime_epoch: int
    localtime: str


class ForcastValue(BaseModel):
    forecastday: List[ForecastDay]


class Forecast(BaseModel):
    forecast: ForcastValue
    location: Location


def get_forecast(lat: float, lng: float):
    dotenv.load_dotenv()
    api_key = os.getenv("WEATHER_API_KEY")
    url = f"https://api.weatherapi.com/v1/forecast.json?key={api_key}&q={lat},{lng}&days=10"
    response = requests.get(url)
    return Forecast.parse_obj(response.json())
