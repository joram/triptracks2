import React, {useContext, useEffect} from "react";
import {Button, Container, Table} from "semantic-ui-react";
import {handleApiErrors, url} from "../../utils/auth";
import {Link} from "react-router-dom";
import {UserContext} from "../../App";
import {getPlans} from "../../utils/api";


function TripPlanList(){
    let [loading, setLoading] = React.useState(true)
    let [tripPlans, setTripPlans] = React.useState([])
    const { accessToken } = useContext(UserContext);

    useEffect(() => {
        if(!loading){
            return
        }
        getPlans(accessToken).then(response => {
            setTripPlans(response.data)
            setLoading(false)
        })
    }, [])

    if(accessToken === undefined || accessToken === null){
        return <Container>you must be logged in before you can create a trip plan list</Container>
    }
    let rows = []
    tripPlans.map((trip_plan, i) => {
        console.log(trip_plan)
        let dtStr = "not scheduled"
        if(trip_plan.dates !== undefined && trip_plan.dates !== null) {
            const datesJson = JSON.parse(trip_plan.dates)
            if (datesJson.type === "basic") {
                const dt = new Date(datesJson.dates)
                dtStr = dt.getFullYear() + "-" + dt.getMonth() + "-" + dt.getDate()
            } else if (datesJson.type === "range") {
                const dates = datesJson.dates.map(d => new Date(d))
                dtStr = dates[0].getFullYear() + "-" + dates[0].getMonth() + "-" + dates[0].getDate() + " to " + dates[1].getFullYear() + "-" + dates[1].getMonth() + "-" + dates[1].getDate()
            }
        }
        rows.push(<Table.Row key={"tripplan_"+i}>
            <Table.Cell>{dtStr}</Table.Cell>
            <Table.Cell><Link to={"/plan/"+trip_plan.id}>{trip_plan.name}</Link></Table.Cell>
        </Table.Row>)
        return ""
    })
    return <>
        <Container>
            <Table celled striped >
                <Table.Header key="headers">
                    <Table.HeaderCell>Date</Table.HeaderCell>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                </Table.Header>
                <Table.Body>{rows}</Table.Body></Table>
            <Button as={Link} to="/plan/create">Create New Trip Plan</Button>
        </Container>
    </>
}

export default TripPlanList;