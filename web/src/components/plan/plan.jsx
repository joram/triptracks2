import React, {useContext, useEffect, useState} from "react";
import {useParams} from 'react-router-dom'
import {Container, Input, Segment} from "semantic-ui-react";
import {UserContext} from "../../App.jsx";
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';
import {getPlan, updatePlan} from "../../utils/api";
import {People} from "./components/people";
import {DatePicker} from "./components/datePicker";
import Itinerary from "./components/itinerary";
import PlanTrails from "./components/planTrails";
import moment from "moment";

function dateToString(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}
function fleshOutItinerary(date, dateRange, isMultiDay, itinerary, setItinerary) {

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

    if(newItinerary !== itinerary) {
        setItinerary(newItinerary)
    }
}

function TripPlan() {
    let [loading, setLoading] = useState(true)
    let [trip_plan, setTripPlan] = useState(null)
    let [name, setName] = useState(null)
    let [isMultiDay, setIsMultiDay] = useState(false)
    let [date, setDate] = useState(null);
    let [dateRange, setDateRange] = useState([]);
    let [people, setPeople] = useState([])
    let [trails, setTrails] = useState([])
    let [itinerary, setItinerary] = useState(null)
    let [fleshedOutItinerary, setFleshedOutItinerary] = useState(false)

    const { accessToken } = useContext(UserContext);
    let {id} = useParams()

    function updateTripPlanState(trip_plan){
        console.log(trip_plan)
        setTripPlan(trip_plan)
        setName(trip_plan.name)
        setPeople(trip_plan.people)
        setTrails(trip_plan.trails)

        // convert date strings to date objects
        trip_plan.itinerary.forEach(day => {
            day.date = new Date(day.date)
        })
        setItinerary(trip_plan.itinerary)


        if (trip_plan.dates === undefined || trip_plan.dates === null){
            trip_plan.dates = {type: "basic", dates: null}
        }
        if(trip_plan.dates.type === "range"){
            setIsMultiDay(true)
            setDateRange(trip_plan.dates.dates)
        } else {
            setIsMultiDay(false)
            setDate(trip_plan.dates.dates)
        }
    }


    useEffect(() => {
        console.log("getting the plan", id, accessToken, loading)
        if (!loading) {
            return
        }
        getPlan(accessToken, id).then(response => {
            console.log("getting the plan")
            updateTripPlanState(response.data)
            setLoading(false)
        });
    }, [accessToken, id, setLoading, loading]);

    useEffect(() => {
        if (loading) {
            return
        }

        // update the trip plan
        trip_plan.name = name
        trip_plan.dates = {
            type: isMultiDay ? "range" : "basic",
            dates: isMultiDay ? dateRange : date
        }
        trip_plan.people = people
        trip_plan.trails = trails
        trip_plan.itinerary = itinerary

        updatePlan(accessToken, trip_plan, id).then(r => {})
    }, [
        accessToken,
        id,
        isMultiDay,
        loading,
        trip_plan,
        people,
        name,
        date,
        dateRange,
        trails,
        itinerary,
    ]);

    if(!loading && !fleshedOutItinerary) {
        setFleshedOutItinerary(true)
        fleshOutItinerary(date, dateRange, isMultiDay, itinerary, setItinerary)
    }

    if(loading){
        return <Container>
            <Segment basic>
                <h1>Loading...</h1>
            </Segment>
        </Container>
    }
    return <Container>

        <Segment basic>
            <Input
                size="huge"
                type="text"
                value={name}
                fluid
                onChange={(e) => setName(e.target.value)}
            />
        </Segment>
        <Segment basic>
            <DatePicker date={date} setDate={setDate} dateRange={dateRange} setDateRange={setDateRange} isMultiDay={isMultiDay} setIsMultiDay={setIsMultiDay}/>
        </Segment>

        <Segment basic>
            <PlanTrails trails={trails} setTrails={setTrails} />
        </Segment>

        <Segment basic>
            <People people={people} setPeople={setPeople} />
        </Segment>

        <Segment basic>
            <Itinerary itinerary={itinerary} setItinerary={setItinerary} trails={trails}/>
        </Segment>

    </Container>
}

export default TripPlan;