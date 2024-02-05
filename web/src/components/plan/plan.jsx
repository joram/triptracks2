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


function TripPlan() {
    let [loading, setLoading] = useState(true)
    let [trip_plan, setTripPlan] = useState(null)
    let [name, setName] = useState(null)
    let [isMultiDay, setIsMultiDay] = useState(false)
    let [date, setDate] = useState(null);
    let [dateRange, setDateRange] = useState([]);
    let [people, setPeople] = useState([])
    let [trails, setTrails] = useState([])
    let [itinerary, setItinerary] = useState([
        {
            date: "2021-01-01",
            timeline: [
                {id:1, startTime: "6:00", icon:"sun outline", color:"grey", description: "sunrise"},
                {id:2, startTime: "7:00", description: "wake up"},
                {id:3, duration: "1:00", description: "breakfast and pack up"},
                {id:4, duration: "2:00", description: "drive to trailhead"},
                {id:5, duration: "1:00", description: "shuttle cars"},
                {id:6, duration: "1:30", description: "ski tour to to Peyto hut"},
                {id:7, startTime: "18:00", duration:"1:00", description: "ski tour to to Peyto hut"},
                {id:8, startTime: "19:00", icon: "sun", color:"grey", description: "sunset"},
                {id:9, startTime: "20:00", icon: "bed", color:"grey", description: "in bed"},
            ],
        },
        {
            date: "2021-01-02",
            timeline: [
                {id:1, startTime: "7:00", description: "wake up"},
                {id:2, duration: "1hr", description: "breakfast and pack up"},
                {id:3, duration: "1hr", description: "drive to trailhead"},
                {id:4, duration: "1hr", description: "shuttle cars"},
                {id:5, duration: "1hr", description: "ski tour to to Peyto hut"},
            ],
        }
    ])

    const { accessToken } = useContext(UserContext);
    let {id} = useParams()

    function updateTripPlanState(trip_plan){
        setTripPlan(trip_plan)
        setName(trip_plan.name)
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
        setPeople(trip_plan.people)
        setTrails(trip_plan.trails)
    }


    useEffect(() => {
        getPlan(accessToken, id).then(response => {
            updateTripPlanState(response.data)
            setLoading(false)
        });
    }, [accessToken, id]);

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

        console.log("sending trip plan", trip_plan)
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
    ]);


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
            <Itinerary itinerary={itinerary} setItinerary={setItinerary}/>
        </Segment>

    </Container>
}

export default TripPlan;