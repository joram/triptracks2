import React, {useContext, useEffect} from "react";
import {Button, Container, Table} from "semantic-ui-react";
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
    }, [accessToken, loading])

    if(accessToken === undefined || accessToken === null){
        return <Container>you must be logged in before you can create a trip plan list</Container>
    }
    let rows = []
    tripPlans.map((trip_plan, i) => {
        let dtStr = "not scheduled"
        if(trip_plan.dates !== undefined && trip_plan.dates !== null) {
            if (trip_plan.dates.type === "basic") {
                const dt = new Date(trip_plan.dates.dates)
                dtStr = dt.getFullYear() + "-" + dt.getMonth() + "-" + dt.getDate()
            } else if (trip_plan.dates.type === "range") {
                const dates = trip_plan.dates.dates.map(d => new Date(d))
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