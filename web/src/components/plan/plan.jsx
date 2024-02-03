import React, {useContext, useEffect, useState} from "react";
import {useParams} from 'react-router-dom'
import {url} from "../../utils/auth.jsx";
import {Accordion, Button, ButtonGroup, Container, Divider, Icon, Input, Segment} from "semantic-ui-react";
import {UserContext} from "../../App.jsx";
// import {Editor} from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import SemanticDatepicker from "react-semantic-ui-datepickers";
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';
import {updatePlan} from "../../utils/api";


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

function DatePicker({isMultiDay, setIsMultiDay, date, setDate, dateRange, setDateRange}){
    return <>
        <ButtonGroup basic style={{marginRight:"10px"}}>
            <Button
                active={!isMultiDay}
                onClick={() => {
                    setIsMultiDay(false)
                    setDate(null)
                }}
            >
                single day
            </Button>
            <Button active={isMultiDay} onClick={() => {
                setIsMultiDay(true)
                setDateRange([])
            }}>multi-day</Button>
        </ButtonGroup>
        <SemanticDatepicker
            key={"date_picker_"+isMultiDay}
            type={isMultiDay ? "range" : "basic" }
            style={{width: "225px"}}
            showToday={true}
            value={isMultiDay ? dateRange : date}
            onChange={(event, data) => {
                if(data.type === "range"){
                    setDateRange(data.value)
                }
                else if(data.type === "basic"){
                    setDate(data.value)
                }
            }}
        />
    </>
}

function TripPlan() {
    let [loading, setLoading] = useState(true)
    let [trip_plan, setTripPlan] = useState(null)
    let [name, setName] = useState(null)
    let [isMultiDay, setIsMultiDay] = useState(false)
    let [date, setDate] = useState(null);
    let [dateRange, setDateRange] = useState([]);

    const { accessToken } = useContext(UserContext);
    let {id} = useParams()

    function updateTripPlanState(trip_plan){
        console.log("receiving trip plan", trip_plan)
        setTripPlan(trip_plan)
        setName(trip_plan.name)
        if(trip_plan.dates.type === "range"){
            setIsMultiDay(true)
            setDateRange(trip_plan.dates.dates.map(d => Date.parse(d)))
        }
        else {
            setIsMultiDay(false)
            setDate(Date.parse(trip_plan.dates.dates))
        }
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
        trip_plan.dates = {
            type: isMultiDay ? "range" : "basic",
            dates: isMultiDay ? dateRange : date
        }
        console.log("sending trip plan", trip_plan)
        updatePlan(accessToken, trip_plan, id).then(response => {
            console.log("response", response)
            return response
        })
    }, [name, date, dateRange]);

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