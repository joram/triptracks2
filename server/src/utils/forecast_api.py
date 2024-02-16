#!/usr/bin/env python3
import enum
from pprint import pprint
from typing import Any, Dict, List, Union, Optional

import requests
from pydantic import BaseModel


class Geometry(BaseModel):
    type: str
    coordinates: List[Union[float, int]]


class TimeSeriesKeys(enum.Enum):
    INSTANT = "instant"
    NEXT_1_HOURS = "next_1_hours"
    NEXT_6_HOURS = "next_6_hours"
    NEXT_12_HOURS = "next_12_hours"


class TimeSeriesDatumDetails(BaseModel):
    air_pressure_at_sea_level: Optional[float] = 0
    air_temperature: Optional[float] = 0
    cloud_area_fraction: Optional[float] = 0
    relative_humidity: Optional[float] = 0
    wind_from_direction: Optional[float] = 0
    wind_speed: Optional[float] = 0
    precipitation_amount: Optional[float] = 0


class TimeSeriesDatum(BaseModel):
    details: TimeSeriesDatumDetails = {}
    summary: Optional[Dict[str, str]] = {}


class TimeSeriesData(BaseModel):
    time: str
    data: Dict[TimeSeriesKeys, TimeSeriesDatum]


class Meta(BaseModel):
    updated_at: str
    units: Dict[TimeSeriesKeys, str]


class Properties(BaseModel):
    meta: Dict[str, Any]
    timeseries: List[TimeSeriesData]


class WeatherForecast(BaseModel):
    type: str
    geometry: Geometry
    properties: Properties


def get_altitude(lat: float, lng: float):
    response = requests.get(
        f"https://api.open-elevation.com/api/v1/lookup?locations={lat},{lng}"
    )
    elevations = [result["elevation"] for result in response.json()["results"]]
    return sum(elevations) / len(elevations)


def get_weather_forecast(
    lat: float, lng: float, altitude: Optional[int] = None
) -> WeatherForecast:
    if altitude is None:
        altitude = int(get_altitude(lat, lng))
    url = f"https://api.met.no/weatherapi/locationforecast/2.0/compact?lat={lat}&lon={lng}&altitude={altitude}"
    print(url)
    response = requests.get(
        url=url,
        headers={"User-Agent": "triptracks/0.1 (https://triptracks.io)"},
    )
    return WeatherForecast.parse_obj(response.json())
