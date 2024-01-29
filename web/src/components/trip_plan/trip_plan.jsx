import React, {useContext, useState} from "react";
import {useParams} from 'react-router-dom'
import {handleApiErrors, url} from "../../utils/auth";
import {Tab} from "semantic-ui-react";
import {UserContext} from "../../App";


function TripPlan() {
    let [trip_plan, setTripPlan] = useState({Group: []})
    let [fetched, setFetched] = useState(false)
    const { accessToken } = useContext(UserContext);
    let {id} = useParams()

    if(!fetched){
        getTripPlan(id).then(packing_list => {
            setFetched(true)
            setTripPlan(packing_list)
        })
    }

    function getTripPlan(id){
      return fetch(url("/api/v0/trip_plan/"+id), {
          method: "GET",
          headers: {
              'Content-Type': 'application/json',
              'Access-Key': accessToken,
          },
      }).then(response => {
          return response.json()
      }).then(response => {
          handleApiErrors(response)
          return response
      })
    }


    console.log(trip_plan)
    const panes = [
      { menuItem: 'Trails', render: () => <Tab.Pane>Tab 1 Content</Tab.Pane> },
      { menuItem: 'Packing Lists', render: () => <Tab.Pane>Tab 2 Content</Tab.Pane> },
      { menuItem: 'Timing', render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
      { menuItem: 'People', render: () => <Tab.Pane>Tab 4 Content</Tab.Pane> },
    ]
    return <>
        <Tab panes={panes}/>
    </>
}

export default TripPlan;