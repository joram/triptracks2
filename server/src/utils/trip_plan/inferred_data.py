import datetime


def add_inferred_data(date, timeline):
    last_end_time = datetime.datetime(
        date.year, date.month, date.day, 0, 0, 0, 0
    )  # midnight
    new_timeline = []
    for item in timeline:
        item["inferred"] = {}

        # convert to date objects
        if "startTime" in item and "T" in item["startTime"]:
            item["startTime"] = datetime.datetime.strptime(
                item["startTime"].split(".")[0], "%Y-%m-%dT%H:%M:%S"
            )
        if "endTime" in item and "T" in item["endTime"]:
            item["endTime"] = datetime.datetime.strptime(
                item["endTime"].split(".")[0], "%Y-%m-%dT%H:%M:%S"
            )

        # infer the start time
        if "startTime" not in item:
            item["inferred"]["startTime"] = last_end_time
        else:
            item["inferred"]["startTime"] = item["startTime"]

        # infer the end time
        if "endTime" not in item:
            item["inferred"]["endTime"] = item["inferred"][
                "startTime"
            ] + datetime.timedelta(minutes=item.get("durationMinutes", 0))
        else:
            item["inferred"]["endTime"] = item["endTime"]

        # infer the display string
        if "timeString" not in item["inferred"]:
            start_str = item["inferred"]["startTime"].strftime("%H:%M")
            end_str = item["inferred"]["endTime"].strftime("%H:%M")
            if start_str == end_str:
                item["inferred"]["timeString"] = start_str
            else:
                item["inferred"][
                    "timeString"
                ] = f"{start_str} - {end_str} ({item.get('durationMinutes', 0)} min)"

        last_end_time = item["inferred"]["endTime"]

        # convert all datetimes to strings
        if "startTime" in item:
            item["startTime"] = item["startTime"].strftime("%Y-%m-%dT%H:%M:%S")
        if "endTime" in item:
            item["endTime"] = item["endTime"].strftime("%Y-%m-%dT%H:%M:%S")
        item["inferred"]["startTime"] = item["inferred"]["startTime"].strftime(
            "%Y-%m-%dT%H:%M:%S"
        )
        item["inferred"]["endTime"] = item["inferred"]["endTime"].strftime(
            "%Y-%m-%dT%H:%M:%S"
        )

        new_timeline.append(item)
    return timeline
