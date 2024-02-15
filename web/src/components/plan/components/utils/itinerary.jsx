import moment from "moment/moment";

function dedupeItinerary(itinerary) {
    let seenDates = new Set()
    let newItinerary = []

    function dateToString(date) {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    }

    itinerary.forEach((day) => {
        let newDay = day
        if (typeof day.date === "string") {
            newDay.date = new Date(day.date)
        }
        const key = dateToString(day.date)
        if (!seenDates.has(key)) {
            newItinerary.push(newDay)
            seenDates.add(key)
        } else {
            console.log("skipping duplicate day", key )
        }
    })
    return newItinerary
}

function dateToString(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function fleshOutItinerary(date, dateRange, isMultiDay, itinerary) {

    function getDatesInItinerary(dateRange, date, isMultiDay) {
        let dates = []
        if (!isMultiDay){
            dates.push(date)
        } else if (dateRange !== null){
            if (dateRange.length === 0 || dateRange.length === 1){
                return []
            }
            if (dateRange[0] === null || dateRange[1] === null){
                return []
            }
            let startDate = moment(dateRange[0])
            let endDate = moment(dateRange[1])
            let currentDate = startDate
            while (currentDate <= endDate) {
                dates.push(currentDate.toDate())
                currentDate = currentDate.add(1, 'days')
            }
        }
        return dates
    }

    function removeExcessDays(dates, itinerary){
        let newItinerary = []
        itinerary.forEach(day => {
            dates.forEach(date => {
                if (dateToString(day.date) === dateToString(date)){
                    newItinerary.push(day)
                }
            })
        })
        return newItinerary
    }

    function upsertDay(date, itinerary){
        if (itinerary === null){
            itinerary = []
        }

        let found = false
        itinerary.forEach(day => {
            if (dateToString(day.date) === dateToString(date)){
                found = true
            }
        })
        if (!found){
            itinerary.push({date: date, timeline: []})
        }
        return itinerary
    }


    date = new Date(date)
    dateRange = dateRange.map(d => new Date(d))
    const dates = getDatesInItinerary(dateRange, date, isMultiDay)
    let newItinerary = itinerary || []
    dates.forEach(date => {
        newItinerary = upsertDay(date, newItinerary)
    })
    newItinerary = removeExcessDays(dates, newItinerary)

    console.log("fleshed out itinerary", newItinerary)
    return newItinerary
}

export {dedupeItinerary}
export default fleshOutItinerary