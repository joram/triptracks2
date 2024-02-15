import datetime

import geohash2
from suntimes import SunTimes

from .inferred_data import add_inferred_data

DT_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"
D_FORMAT = "%Y-%m-%d"


def flesh_out_itinerary(trails, itinerary):
    def _get_coords(trails):
        trails.reverse()
        for geohash_code in trails:
            try:
                int(geohash_code)
                continue
            except:
                pass

            try:
                lat, lng = geohash2.decode(geohash_code)
                lat = float(lat)
                lng = float(lng)
                return lat, lng
            except Exception as e:
                print(e)
                continue
        return 0, 0

    def _upsert_sunrise(place, date, timeline):
        sunrise_dt = place.riselocal(date)
        sunrise_event = {
            "description": "sunrise",
            "startTime": sunrise_dt.strftime(DT_FORMAT),
            "durationMinutes": 0,
            "icon": "sun outline",
            "inferred": {
                "timeString": sunrise_dt.strftime("%I:%M %p"),
            },
            "editable": False,
        }

        for i, event in enumerate(timeline):
            if event.get("description") == "sunrise":
                timeline[i] = sunrise_event
                return timeline

        timeline.append(sunrise_event)
        return timeline

    def _upsert_sunset(place, date, timeline):
        sunset_dt = place.setlocal(date)
        sunset_event = {
            "description": "sunset",
            "startTime": sunset_dt.strftime(DT_FORMAT),
            "durationMinutes": 0,
            "icon": "sun",
            "inferred": {
                "timeString": sunset_dt.strftime("%I:%M %p"),
            },
            "editable": False,
        }

        for i, event in enumerate(timeline):
            if event.get("description") == "sunset":
                timeline[i] = sunset_event
                return timeline

        timeline.append(sunset_event)
        return timeline

    newItinerary = []
    lat, lng = _get_coords(trails)
    place = SunTimes(lng, lat)
    for i, day in enumerate(itinerary):
        date = day["date"]
        if "T" in date:
            date = datetime.datetime.strptime(date, DT_FORMAT).date()
        else:
            date = datetime.datetime.strptime(date, D_FORMAT).date()
        timeline = day["timeline"]
        timeline = _upsert_sunrise(place, date, timeline)
        timeline = _upsert_sunset(place, date, timeline)
        timeline = add_inferred_data(date, timeline)
        newItinerary.append(
            {
                "date": date.strftime("%Y-%m-%d"),
                "timeline": timeline,
            }
        )

    return newItinerary
