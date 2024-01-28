import React from "react";
import {url} from "../topNav";
import {Redirect} from "react-router-dom";
import {getAccessKey} from "../../utils/auth";


function PackingCreate() {
    let [creating, setCreating] = React.useState(true)
    let [id, setId] = React.useState(undefined)

    React.useEffect(() => {
        fetch(url("/api/v0/packing_list"), {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Key': getAccessKey(),
                },
                body: ""
            }
        ).then(response => response.json()).then(response => {
            setId(response)
            setCreating(false)
        })
    })

    if(!creating){
        return <Redirect to={"/packing/" + id}/>
    }

    return <>creating a new packing list, please hold</>
}

export default PackingCreate;