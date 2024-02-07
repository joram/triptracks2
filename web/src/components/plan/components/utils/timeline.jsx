import moment from "moment/moment";
import {getSunrise, getSunset} from "sunrise-sunset-js";

function upsertSunriseToTimeline(date, timeline, coordinates){
    if(coordinates === null){
        coordinates = {lat: 0, lng: 0}
    }
    if (typeof date === "string"){
        date = new Date(date)
    }

    let maxId = 0
    timeline.forEach((item) => {
        if(item.id > maxId){
            maxId = item.id
        }
    })

    const sunrise = getSunrise(coordinates.lat, coordinates.lng, date);
    let sunriseExists = false
    timeline.forEach((item) => {
        if(item.description === "sunrise"){
            sunriseExists = true
        }
    })
    if (!sunriseExists){
        console.log("adding sunrise to timeline")
        timeline.push({
            id: maxId + 1,
            description: "sunrise",
            icon: "sun outline",
            startTime: sunrise,
            endTime: sunrise,
            duration: "00:00",
            inferred: {
                startTime: sunrise,
                endTime: sunrise,
                durationMinutes: 0,
                timeString: moment(sunrise).format("HH:mm")
            }
        })
        maxId += 1
    }

    const sunset = getSunset(coordinates.lat, coordinates.lng, date);
    let sunsetExists = false
    timeline.forEach((item) => {
        if(item.description === "sunset"){
            sunsetExists = true
        }
    })
    if (!sunsetExists){
        console.log("adding sunset to timeline")
        timeline.push({
            maxId: maxId + 1,
            description: "sunset",
            icon: "sun",
            startTime: sunset,
            endTime: sunset,
            duration: "00:00",
            inferred: {
                startTime: sunset,
                endTime: sunset,
                durationMinutes: 0,
                timeString: moment(sunset).format("HH:mm")
            }
        })
    }



    return timeline
}

function upsertInferredData(date, timeline){
    if (typeof date === "string"){
        date = new Date(date)
    }
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

    let lastEndTime = new Date(year, month, day, 0, 0, 0, 0)  // midnight

    let newTimeline = timeline.map((item, index) => {
        item.inferred = {
            startTime: false,
            endTime: false,
            durationMinutes: false,
        }

        if(item.startTime === undefined){
            item.inferred.startTime = lastEndTime
        } else {
            item.inferred.startTime = item.startTime
            // convert startTime to a date object
            if(!(item.startTime instanceof Date)){
                console.log(item)
                let [hours, minutes] = item.inferred.startTime.split(":")
                hours = parseInt(hours)
                minutes = parseInt(minutes)
                item.inferred.startTime = new Date(year, month, day, hours, minutes, 0, 0)
            }
        }


        if(item.endTime === undefined && item.duration === undefined){
            item.inferred.endTime = item.inferred.startTime
            item.inferred.durationMinutes = 0
        }

        if(item.duration !== undefined){
            let [durationHours, durationMinutes] = item.duration.split(":")
            let totalDurationMinutes = parseInt(durationHours) * 60 + parseInt(durationMinutes)
            item.inferred.durationMinutes = totalDurationMinutes
            let endDt = moment(item.inferred.startTime).add(totalDurationMinutes, 'minutes').toDate()
            console.log(`adding ${totalDurationMinutes} minutes to ${item.inferred.startTime} to get ${endDt}`)

            item.inferred.endTime = endDt
            lastEndTime = endDt
        }

        const startStr = moment(item.inferred.startTime).format("HH:mm")
        const endStr = moment(item.inferred.endTime).format("HH:mm")
        item.inferred.timeString = `${startStr} - ${endStr} (${item.inferred.durationMinutes+" min" || 'unknown'})`

        lastEndTime = item.inferred.endTime
        return item
    })
    return newTimeline
}


function fleshOutTimeline(date, timeline, coordinates){
    if(typeof date === "string"){
        date = new Date(date)
    }
    timeline = upsertSunriseToTimeline(date, timeline, coordinates)
    timeline = upsertInferredData(date, timeline)
    return timeline
}

export default fleshOutTimeline
