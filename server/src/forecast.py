from typing import Optional

from pydantic import BaseModel

from .app import app
from .utils.avalanche_canada import Avalanche
from .utils.forecast_api import Forecast as ForecastResponse, get_forecast


class Forecast(BaseModel):
    avalanche: Optional[Avalanche]
    weather: ForecastResponse


@app.get("/api/v0/forecast", response_model=Forecast)
async def forecast(
        lat: float = 48.4284,
        lng: float = -123.3656,
):
    return Forecast(
        weather=get_forecast(lat, lng),
        # avalanche=Avalanche.from_html(response.text),
    )

