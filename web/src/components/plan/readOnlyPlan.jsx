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
    const dates = trip_plan.dates || {type: "basic", dates: null}
    if (dates.type === "range"){
        const range = dates.dates || []
        if(range.length === 2 && range[0] && range[1]){
            let start = moment(range[0]).format("MMM Do")
            let end = moment(range[1]).format("MMM Do")
            subheader = `from ${start} to ${end}`
        }else if(range.length === 1 && range[0]){
            subheader = `on ${moment(range[0]).format("MMM Do")}`
        }
    } else {
        if(dates.dates){
            subheader = `on ${moment(dates.dates).format("MMM Do")}`
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