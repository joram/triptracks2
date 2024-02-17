import React, {useContext, useEffect, useState} from "react";
import {useParams} from 'react-router-dom'
import {Container, Header, Input, Segment} from "semantic-ui-react";
import {UserContext} from "../../App.jsx";
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';
import {getPlan, updatePlan} from "../../utils/api";
import {People} from "./components/people";
import {DatePicker} from "./components/datePicker";
import Itinerary from "./components/itinerary";
import PlanTrails from "./components/planTrails";
import * as PropTypes from "prop-types";
import {Forecast} from "./components/forecast";
import moment from "moment";

Forecast.propTypes = {trails: PropTypes.arrayOf(PropTypes.any)};

function ReadOnlyTripPlan({trip_plan}) {
    console.log("read only plan is: ", trip_plan)
    let subheader = "dates TBD"
    if (trip_plan.dates.type === "range"){
        if(trip_plan.dates.dates.length === 2){
            let start = trip_plan.dates.dates[0]
            start = moment(start).format("MMM Do")
            let end = trip_plan.dates.dates[1]
            end = moment(end).format("MMM Do")
            subheader = `from ${start} to ${end}`
        }else if(trip_plan.dates.dates.length === 1){
            subheader = `on ${trip_plan.dates.dates[0]}`
        } else {
            subheader = "dates TBD"
        }
    } else {
        if(trip_plan.date !== null){
            subheader = `on ${trip_plan.date}`
        }
    }
    return <Container>

        <Segment basic>
            <Header size={"huge"}>{trip_plan.name}</Header>
        </Segment>

        <Segment basic>
            <Header.Subheader size={"large"}>{subheader}</Header.Subheader>
        </Segment>

        <Segment basic size={"mini"}>
            <Forecast trails={trip_plan.trails} date={trip_plan.date} dateRange={trip_plan.dateRange} isMultiDay={trip_plan.isMultiDay} />
        </Segment>
        <Segment basic>
            <PlanTrails trails={trip_plan.trails} />
        </Segment>

        <Segment basic>
            <People people={trip_plan.people} editable={false} />
        </Segment>

    </Container>
}

export default ReadOnlyTripPlan;