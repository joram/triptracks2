import moment from "moment/moment";

function upsertInferredData(date, timeline){
    date = new Date(date)
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

    let lastEndTime = new Date(year, month, day, 0, 0, 0, 0)  // midnight

    let newTimeline = timeline.map((item, index) => {
        item.inferred = {}

        // convert to date objects
        if(item.startTime !== undefined){
            item.startTime = new Date(item.startTime)
        }
        if(item.endTime !== undefined){
            item.endTime = new Date(item.endTime)
        }

        // infer the start time
        if(item.startTime === undefined){
            item.inferred.startTime = lastEndTime
        } else {
            item.inferred.startTime = item.startTime
        }

        // infer the end time
        if(item.endTime === undefined){
            item.inferred.endTime = item.inferred.startTime
        } else {
            item.inferred.endTime = item.endTime
        }

        // infer the display string
        if(item.inferred.timeString === undefined){
            const startStr = moment(item.inferred.startTime).format("HH:mm")
            const endStr = moment(item.inferred.endTime).format("HH:mm")
            if(startStr === endStr){
                item.inferred.timeString = startStr
            } else {
                item.inferred.timeString = `${startStr} - ${endStr} (${item.inferred.durationMinutes+" min" || 'unknown'})`
            }
        }

        lastEndTime = item.inferred.endTime
        return item
    })
    return newTimeline
}


function fleshOutTimeline(date, timeline){
    if(typeof date === "string"){
        date = new Date(date)
    }
    timeline = upsertInferredData(date, timeline)
    return timeline
}

export default fleshOutTimeline
