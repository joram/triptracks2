import React, {useContext} from "react";
import {url} from "../../utils/auth";
import {Redirect} from "react-router-dom";
import {UserContext} from "../../App";


function TripPlanCreate(){
    let [id, setId] = React.useState(undefined)
    const { accessToken } = useContext(UserContext);
    if(id !== undefined){
        return <Redirect to={"/plan/" + id}/>
    }
    fetch(url("/api/v0/trip_plan"), {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Access-Key': accessToken,
        },
        body: ""
    }
    ).then(response => response.json()).then(response => {
        setId(response)
    })

    return <>creating a new tripPlan list, please hold</>
}

export default TripPlanCreate;