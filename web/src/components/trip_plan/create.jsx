import React, {Component} from "react";
import {url} from "../topNav";
import {Redirect} from "react-router-dom";
import {AccessKeyContext} from "../../utils/context";


class TripPlanCreate extends Component {
    state = {
        creating: true
    }
    render() {
        if(!this.state.creating){
            return <Redirect to={"/plan/" + this.state.id}/>
        }
        fetch(url("/api/v0/trip_plan"), {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Access-Key': AccessKeyContext.accessKey,
            },
            body: ""
        }
        ).then(response => response.json()).then(response => {
            console.log("response:", response)
            this.setState({
                creating: false,
                id: response,
            })
        })

        return <>creating a new tripPlan list, please hold</>
    }
}

export default TripPlanCreate;