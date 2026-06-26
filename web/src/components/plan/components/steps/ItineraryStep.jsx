import React from "react";
import {Header, Segment} from "semantic-ui-react";
import {DatePicker} from "../datePicker";
import {Forecast} from "../forecast";
import Itinerary from "../itinerary";

// Pick the trip dates, preview the forecast, and edit the per-day itinerary.
export function ItineraryStep({
    isMultiDay, setIsMultiDay, date, setDate, dateRange, setDateRange,
    itinerary, setItinerary, trails,
}) {
    return <>
        <Header size={"large"}>Itinerary</Header>

        <Segment basic>
            <DatePicker
                isMultiDay={isMultiDay}
                setIsMultiDay={setIsMultiDay}
                date={date}
                setDate={setDate}
                dateRange={dateRange}
                setDateRange={setDateRange}
            />
        </Segment>

        <Segment basic size={"mini"}>
            <Forecast trails={trails} date={date} dateRange={dateRange} isMultiDay={isMultiDay}/>
        </Segment>

        <Segment basic>
            <Itinerary itinerary={itinerary} setItinerary={setItinerary}/>
        </Segment>
    </>;
}

export default ItineraryStep;
