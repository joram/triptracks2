
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
            console.log("adding day", key)
            newItinerary.push(newDay)
            seenDates.add(key)
        } else {
            console.log("skipping duplicate day", key )
        }
    })
    return newItinerary
}

export default dedupeItinerary