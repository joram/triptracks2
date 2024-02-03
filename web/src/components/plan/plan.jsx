import React, {useContext, useEffect, useState} from "react";
import {useParams} from 'react-router-dom'
import {url} from "../../utils/auth.jsx";
import {
    Accordion,
    Button,
    ButtonGroup,
    Card,
    CardGroup,
    Container,
    Divider,
    Icon,
    Input,
    Image,
    Segment, Item, ItemGroup
} from "semantic-ui-react";
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

function Person({person, removePerson}){
    const defaultImage = "https://react.semantic-ui.com/images/avatar/large/matthew.png"
    let name = "Unknown"
    let image = defaultImage
    if(typeof person === "string"){
        name = person
    } else {
        name = person.google_info.name
        image = person?.google_info?.picture || defaultImage
    }

    return <Item>
        <Image circular size="tiny" src={image} />
        <Item.Content verticalAlign="middle" >
            <Item.Header>{name}</Item.Header>
        </Item.Content>
        <Item.Meta>
            <Item.Extra floated="right">
                <Button icon={"remove"} onClick={() => {
                    removePerson(person)
                }} />
            </Item.Extra>

        </Item.Meta>
    </Item>

}

function People({people, setPeople}){
    let [newPersonEmail, setNewPersonEmail] = useState("")

    function removePerson(person){
        let newPeople = people.slice()
        newPeople.splice(newPeople.indexOf(person), 1)
        setPeople(newPeople)
    }


    let cards = [];
    if(people !== null){
        cards = people.map((person, i) => {
            return <Person person={person} removePerson={removePerson} key={"person_"+i}/>
        })
    }

    return <Segment compact basic a>
        <Item.Group style={{textAlign:"left"}}>
            {cards}
            <Item key="add_person">
                <Item.Content>
                    <Icon name={"add user"} size="large" />
                    <Item.Header>
                        <Input
                            type="text"
                            placeholder="Add By Email"
                            value={newPersonEmail}
                            onChange={(e) => {
                                setNewPersonEmail(e.target.value)
                            }}
                        />
                        <Button
                            icon={"add"}
                            style={{floated:"right"}}
                            onClick={() => {
                            console.log("adding person", newPersonEmail)
                            let newPeople = people? people.slice() : [];
                            newPeople.push(newPersonEmail)
                            setPeople(newPeople)
                        }} />
                    </Item.Header>
                </Item.Content>
            </Item>
        </Item.Group>
    </Segment>
}

function TripPlan() {
    let [loading, setLoading] = useState(true)
    let [trip_plan, setTripPlan] = useState(null)
    let [name, setName] = useState(null)
    let [isMultiDay, setIsMultiDay] = useState(false)
    let [date, setDate] = useState(null);
    let [dateRange, setDateRange] = useState([]);
    let [people, setPeople] = useState([])

    const { accessToken, user } = useContext(UserContext);
    let {id} = useParams()

    function updateTripPlanState(trip_plan){
        console.log("cookie has", user)
        setTripPlan(trip_plan)
        setName(trip_plan.name)
        if (trip_plan.dates === undefined || trip_plan.dates === null){
            trip_plan.dates = {type: "basic", dates: null}
        }
        if(trip_plan.dates.type === "range"){
            setIsMultiDay(true)
            setDateRange(trip_plan.dates.dates.map(d => Date.parse(d)))
        }
        else {
            setIsMultiDay(false)
            setDate(Date.parse(trip_plan.dates.dates))
        }
        setPeople(trip_plan.people)
    }


    useEffect(() => {
        getTripPlan(id, accessToken).then(trip_plan => {
            updateTripPlanState(trip_plan)
            setLoading(false)
        });
    }, [accessToken, id]);

    useEffect(() => {
        console.log("useEffect", name, date, dateRange, people);
        if(loading) {
            console.log("still loading");
            return
        }
        trip_plan.name = name
        trip_plan.dates = {
            type: isMultiDay ? "range" : "basic",
            dates: isMultiDay ? dateRange : date
        }
        trip_plan.people = people
        console.log("sending trip plan", trip_plan)
        updatePlan(accessToken, trip_plan, id).then(response => {})
    }, [accessToken, id, isMultiDay, loading, trip_plan, people, name, date, dateRange]);


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
                <People
                    people={people}
                    setPeople={(newPeople) => {
                        console.log("setting people", newPeople)
                        setPeople(newPeople)
                    }}
                />
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