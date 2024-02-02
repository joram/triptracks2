import React, {useContext, useEffect, useState} from "react";
import {useParams} from 'react-router-dom'
import {url} from "../../utils/auth.jsx";
import {Accordion, Button, ButtonGroup, Container, Divider, Header, Icon, Input, Segment} from "semantic-ui-react";
import {UserContext} from "../../App.jsx";
// import {Editor} from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import SemanticDatepicker from "react-semantic-ui-datepickers";
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';
import {ServerConfiguration} from "@triptracks/client";
import {DefaultApi, TripPlanRequest} from "triptracks/src";
import ApiClient from "triptracks/src/ApiClient";

function AccordionSection({index, title, icon, children}){
    let [active, setActive] = useState(true)

    return <>
        <Accordion.Title
            active={active}
            index={index}
            onClick={() => setActive(!active)}
        >
            <h2 align="left">
                <Icon name="dropdown" />
                <Icon name={icon} size="large" style={{margin:"15px"}}/>
                {title}
                <Divider />
            </h2>
        </Accordion.Title>
        <Accordion.Content active={active}>
            {children}
        </Accordion.Content>
        </>
}

function Itinerary(){
    return <>  itinerary </>
}

async function getTripPlan(id, accessToken){
    return fetch(url("/api/v0/trip_plan/"+id), {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Access-Key': accessToken,
        },
    }).then(response => {
        return response.json()
    }).then(response => {
        console.log("accesstoken", accessToken, "plan", response)
        return response
    })
}

async function updateTripPlan(trip_plan, id, accessToken){
    if (trip_plan.dates === null || trip_plan.dates === undefined){
        trip_plan.dates = null
    } else if(trip_plan.dates.dates === null || trip_plan.dates.dates === undefined){
        trip_plan.dates = null
    }


    const api = new DefaultApi(new ApiClient("https://triptracks2.oram.ca"))
    api.createTripPlanApiV0TripPlanPost(new TripPlanRequest("foo"), (error, data, response) => {
        if (error) {
            console.error(error);
        } else {
            console.log('API called successfully. Returned data: ' + data);
        }
    });

// Use configuration with your_api
    return fetch(url("/api/v0/trip_plan/"+id), {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Access-Key': accessToken,
        },
        body: JSON.stringify(trip_plan)
    }).then(response => {
        return response.json()
    })
}

function TripPlan() {
    let [loading, setLoading] = useState(true)
    let [trip_plan, setTripPlan] = useState(null)
    let [name, setName] = useState(null)
    let [isMultiDay, setIsMultiDay] = useState(false)
    let [startDate, setStartDate] = useState(null);
    let [endDate, setEndDate] = useState(null);

    const { accessToken } = useContext(UserContext);
    let {id} = useParams()

    function updateTripPlanState(trip_plan){
        console.log("receiving trip plan", trip_plan)
        setTripPlan(trip_plan)
        setName(trip_plan.name)
        if (trip_plan.dates === null || trip_plan.dates === undefined){
            setStartDate(null)
            setEndDate(null)
            setIsMultiDay(false)
        }
        else if(trip_plan.dates.type === "basic"){
            setStartDate(trip_plan.dates.date)
            setIsMultiDay(false)
        }
        else if(trip_plan.dates.type === "range"){
            const dates = [Date.parse(trip_plan.dates.dates[0]), Date.parse(trip_plan.dates.dates[1])]
            console.log(dates)
            setStartDate(dates[0])
            setEndDate(dates[1])
            setIsMultiDay(true)
        }
        // else {
        //     setStartDate(null)
        //     setEndDate(null)
        //     setIsMultiDay(true)
        // }
        setLoading(false)
    }


    useEffect(() => {
        getTripPlan(id, accessToken).then(trip_plan => {
            updateTripPlanState(trip_plan)
        });
    }, []);

    useEffect(() => {
        if(loading)
            return
        trip_plan.name = name
        if(isMultiDay){
            trip_plan.dates = {
                type: "range",
                dates: [startDate, endDate]
            }
        } else {
            trip_plan.dates = {
                type: "basic",
                dates: startDate
            }
        }
        console.log("sending trip plan", trip_plan)
        updateTripPlan(trip_plan, id, accessToken).then(new_trip_plan => {
            updateTripPlanState(new_trip_plan)
        })
    }, [name, startDate, endDate]);

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
            <ButtonGroup basic style={{marginRight:"10px"}}>
                <Button
                    active={!isMultiDay}
                    onClick={() => {
                        setIsMultiDay(false)
                        setStartDate(null)
                        setEndDate(null)
                    }}
                >
                    single day
                </Button>
                <Button active={isMultiDay} onClick={() => {
                    setIsMultiDay(true)
                    setStartDate(null)
                    setEndDate(null)
                }}>multi-day</Button>
            </ButtonGroup>
            <SemanticDatepicker
                key={"date_picker_"+isMultiDay}
                type={isMultiDay ? "range" : "basic" }
                style={{width: "225px"}}
                showToday={true}
                value={isMultiDay ? [startDate, endDate] : startDate}
                onChange={(event, data) => {
                    console.log(data)
                    if(data.type === "range"){
                        if (data.value === null)
                            return
                        setStartDate(data.value[0])
                        setEndDate(data.value[1])
                    }
                    else if(data.type === "basic"){
                        setStartDate(data.value)
                        setEndDate(null)
                    }
                }}
            />
        </Segment>

        <Accordion fluid>
            <AccordionSection index={0} title="People" icon="group">
                Hello world
            </AccordionSection>

            <AccordionSection index={1} title="Trails" icon="map signs">
            </AccordionSection>

            <AccordionSection index={2} title="Itinerary" icon="clipboard list">
                <Itinerary/>
            </AccordionSection>

            <AccordionSection index={3} title="Packing" icon="calendar minus">
            </AccordionSection>
        </Accordion>
    </Container>
}

export default TripPlan;