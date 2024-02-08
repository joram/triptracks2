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
import fleshOutItinerary from "./components/utils/itinerary";


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

        if(trip_plan.itinerary.date !== undefined){
            trip_plan.itinerary = []
        }
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
        const newItinerary = fleshOutItinerary(date, dateRange, isMultiDay, itinerary)
        setItinerary(newItinerary)
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