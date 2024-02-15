import React, {useContext, useEffect, useState} from "react";
import {useParams} from 'react-router-dom'
import {Container, Input, Segment} from "semantic-ui-react";
import {UserContext} from "../../App.jsx";
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';
import {getForecast, getPlan, updatePlan} from "../../utils/api";
import {People} from "./components/people";
import {DatePicker} from "./components/datePicker";
import Itinerary from "./components/itinerary";
import PlanTrails from "./components/planTrails";
import fleshOutItinerary from "./components/utils/itinerary";
import * as PropTypes from "prop-types";
import {Chart} from "react-google-charts";
import moment from "moment/moment";

function Forecast({isMultiDay, date, dateRange, trails}){
    let [forecast, setForecast] = useState(null)
    let [geohash, setGeohash] = useState(null)
    let [details, setDetails] = useState(null)

    useEffect(() => {
        const longestGeohash = trails.sort(
            function (a, b) {
                return b.length - a.length;
            }
        )[0];

        fetch(`/trail_details/${longestGeohash}.json`).then(results => results.json()).then(newDetails => {
            setDetails(newDetails)
            console.log("getting the forecast", newDetails)
            getForecast(newDetails.center_lat, newDetails.center_lng).then(response => {
                console.log(response.data)
                // setForecast(response.data)
                const data = [
                    ["Date", "PoP"],
                ];
                let i =0;
                response.data.weather.daily_forecasts.forEach(day => {
                    data.push([i, day.precip_probability])
                    i += 1
                })

                console.log(data)
                setForecast(data)
            //     {primary: Wed Feb 14 2024 16:00:00 GMT-0800 (Pacific Standard Time), secondary: 28, radius: undefined}
            })
        })
    }, [trails]);

    if (forecast === null){
        return <Container>
            <Segment basic>
                <h1>Loading...</h1>
            </Segment>
        </Container>
    }




    const options = {
        title: "Probability of Precipitation",
        curveType: "function",
        legend: { position: "bottom" },
    };

    return <Chart
        chartType="LineChart"
        width="100%"
        height="400px"
        data={forecast}
        options={options}
    />
}

Forecast.propTypes = {trails: PropTypes.arrayOf(PropTypes.any)};

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
    let [manualTrigger, setManualTrigger] = useState(true)

    const { accessToken } = useContext(UserContext);
    let {id} = useParams()

    async function updateTripPlanState(trip_plan){
        console.log("updating latest trip plan", trip_plan)
        setTripPlan(trip_plan)
        setName(trip_plan.name)
        setPeople(trip_plan.people)
        setTrails(trip_plan.trails)


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

        return trip_plan
    }


    useEffect(() => {
        if (!loading) {
            return
        }
        getPlan(accessToken, id).then(response => {
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

        if(manualTrigger === false){
            return
        }
        updatePlan(accessToken, trip_plan, id).then(r => {
            console.log("updated trip plan", r)
            if (r.status === 200 && r.data !== null && r.data !== undefined && r.data !== trip_plan){
                console.log("updating local state")
                setManualTrigger(false)
                updateTripPlanState(r.data).then(() => {
                  setManualTrigger(true)
                })
            }
        })
    }, [
        accessToken,
        id,
        isMultiDay,
        loading,
        people,
        name,
        date,
        dateRange,
        trails,
        itinerary,
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
            <Forecast trails={trails} date={date} dateRange={dateRange} isMultiDay={isMultiDay} />
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