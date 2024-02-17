from functools import lru_cache
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from utils.avalanche_canada import Avalanche
from utils.forecast_api import get_weather_forecast, WeatherForecast

router = APIRouter()


class Forecast(BaseModel):
    avalanche: Optional[Avalanche]
    weather: WeatherForecast


@lru_cache(32)
def get_cached_forecast(lat: float, lng: float) -> WeatherForecast:
    return get_weather_forecast(lat, lng)


@router.get("/api/v0/forecast", response_model=Forecast)
async def forecast(
    lat: float = 48.4284,
    lng: float = -123.3656,
):
    return Forecast(
        weather=get_cached_forecast(lat, lng),
        # avalanche=Avalanche.from_html(response.text),
    )