import React from "react";
import Timeline from "./itineraryTimeline";
import {dedupeItinerary} from "./utils/itinerary";


function Itinerary({itinerary, setItinerary}) {
    itinerary = dedupeItinerary(itinerary)
    if(itinerary === null){
        return <></>
    }

    function setNewTimeline(date, newTimeline){
        try {
            date = new Date(date)

            function dateToString(date) {
                return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
            }

            let newItinerary = []
            itinerary.forEach(day => {
                if (dateToString(day.date) === dateToString(date)) {
                    day.timeline = newTimeline
                }
                newItinerary.push(day)
            })
            setItinerary(newItinerary);
        } catch (error) {
            console.error(error)
        }
    }

    let itineraryDays = []
    itinerary.forEach((itineraryDay) => {
      itineraryDays.push(<Timeline
          key={itineraryDay.date}
          day={itineraryDay.date}
          timeline={itineraryDay.timeline}
          setTimeline={setNewTimeline}
      />)
    })

    return <>
        <h1>Itinerary</h1>
        {itineraryDays}
    </>
}

export default Itinerary;
