import React, {useContext} from "react";
import {Redirect} from "react-router-dom";
import {url} from "../../utils/auth";
import {UserContext} from "../../App";


function PackingCreate() {
    let [creating, setCreating] = React.useState(true)
    let [id, setId] = React.useState(undefined)
    const { accessToken } = useContext(UserContext);
    React.useEffect(() => {
        fetch(url("/api/v0/packing_list"), {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Key': accessToken,
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