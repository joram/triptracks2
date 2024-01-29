import React, {Component, useContext, useEffect} from "react";
import {Button, Container, Table} from "semantic-ui-react";
import {getAccessKey, handleApiErrors, isLoggedIn, url} from "../../utils/auth";
import {Link} from "react-router-dom";
import {UserContext} from "../../App";


function TripPlanList(){
    let [tripPlans, setTripPlans] = React.useState([])
    const { accessToken } = useContext(UserContext);

    async function getTripPlans() {
        return await fetch(url("/api/v0/trip_plans"), {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Access-Key': accessToken,
            },
        })
            .then(response => response.json())
            .then(trip_plans => {
                handleApiErrors(trip_plans)
                if(trip_plans.detail !== undefined){
                    return []
                }
                return trip_plans
            })
    }

    function removeTripPlan(trip_plan_id) {
        return fetch(url("/api/v0/trip_plan/"+trip_plan_id), {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'Access-Key': accessToken,
            },
            body: "{}"
        })
    }


    function refreshList() {
        getTripPlans().then(trip_plans => {
            let state = this.state;
            state.trip_plans = trip_plans
            this.setState(state)
        })
    }

    useEffect(() => {
        getTripPlans().then(trip_plans => {
            setTripPlans(trip_plans)
        })
    }, []);

    function removeTripPlanList(id){
        removeTripPlan(id).then(()=> {
            refreshList()
        })
    }



    if(accessToken === undefined || accessToken === null){
        return <Container>you must be logged in before you can create a trip plan list</Container>
    }
    let rows = []
    tripPlans.map((trip_plan, i) => {
        rows.push(<Table.Row key={"tripplan_"+i}>
            <Table.Cell>Date</Table.Cell>
            <Table.Cell><Link to={"/plan/"+trip_plan.id}>{trip_plan.name}</Link></Table.Cell>
            <Table.Cell># ppl</Table.Cell>
            <Table.Cell># trails</Table.Cell>
            <Table.Cell># packing lists</Table.Cell>
            <Table.Cell><Button onClick={()=>{this.removeTripPlanList(trip_plan.id)}}>Remove</Button></Table.Cell>
        </Table.Row>)
        return ""
    })
    return <>
        <Container>
            <Table celled striped>
                <Table.Header key="headers">
                    <Table.HeaderCell>Date</Table.HeaderCell>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell># people</Table.HeaderCell>
                    <Table.HeaderCell># trails</Table.HeaderCell>
                    <Table.HeaderCell># packing lists</Table.HeaderCell>
                    <Table.HeaderCell>Remove</Table.HeaderCell>
                </Table.Header>
                <Table.Body>{rows}</Table.Body></Table>
            <Button as={Link} to="/plan/create">Create New Trip Plan</Button>
        </Container>
    </>
}

export default TripPlanList;