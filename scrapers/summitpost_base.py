from base import BaseScraper


class BaseSummitPostScraper(BaseScraper):

    def _description(self, bs):
        description = {}
        descriptionDiv = bs.find("div", {"class": "full-content"})
        section_title = ""
        section_content = []
        if descriptionDiv is None:
            return ""
        for child in descriptionDiv.contents:
            if child.name == "h2":
                if section_title != "":
                    description[section_title] = "\n".join(section_content)
                if child is not None and child.string is not None:
                    section_title = child.string.strip(" ").strip(" ")
                section_content = []
            else:
                if child.string not in [None, "\\n"]:
                    section_content.append(child.string.strip("\\n").strip(" "))
        if section_title != "":
            description[section_title] = "\n".join(section_content)
        return description

    def _details(self, bs):
        table = bs.find("table", {"class": "object-properties-table"})
        if table is None:
            return {}

        details = {}
        rows = table.find_all("tr")
        for tr in rows:
            key = tr.find("th")
            val = tr.find("td")
            if key is not None and key.text is not None:
                if key.text.lower() == "lat/lng:":
                    val = tr.find("a")
                key = key.text.strip("\\n").strip(":").lower()
                if key == "gpx file":
                    val = "https://www.summitpost.org"+val.find("a").attrs["href"]
                else:
                    val = val.text.strip("\\n")
                if key in ["route type", "season"]:
                    val = [route_type.strip(" ") for route_type in val.split(",")]
                if key == "lat/lon":
                    lat, lng = val.split(" / ")

                    lat_val, lat_dir = lat.split("°")
                    lat_val = float(lat_val)
                    if lat_dir == "S":
                        lat_val = lat_val*-1.0

                    lng_val, lng_dir = lng.split("°")
                    lng_val = float(lng_val)
                    if lng_dir == "W":
                        lng_val = lng_val*-1.0

                    val = {"lat": lat_val, "lng": lng_val}

                if key != "":
                    details[key] = val
        return details

    def _title(self, bs):
      return bs.find("h1", {"class": "adventure-title"}).string

    def _list_item_urls(self, bs):
        urls = []
        cci_thumbs = bs.find_all("a", {"class": "cci-thumb"})
        for thumb in cci_thumbs:
            href = thumb.attrs['href'].replace("\'", "").replace("\\", "").lstrip("/")
            url = f"https://www.summitpost.org/{href}"
            urls.append(url)
        return urls
