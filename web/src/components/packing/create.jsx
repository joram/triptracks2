import React, {Component} from "react";
import {url} from "../topNav";
import {Redirect} from "react-router-dom";
import {AccessKeyContext} from "../../context";


class PackingCreate extends Component {
    state = {
        creating: true
    }
    render() {
        if(!this.state.creating){
            return <Redirect to={"/packing/" + this.state.id}/>
        }
        fetch(url("/api/v0/packing_list"), {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Access-Key': AccessKeyContext.accessKey,
            },
            body: ""
        }
        ).then(response => response.json()).then(response => {
            this.setState({
                creating: false,
                id: response,
            })
        })

        return <>creating a new packing list, please hold</>
    }
}

export default PackingCreate;