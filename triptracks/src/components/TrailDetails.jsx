import React, {useState} from "react";
import {useParams} from "react-router-dom";

export default function TrailDetails() {
    let [data, setData] = useState(null)
    let { geohash } = useParams();

    if(data===null){
        fetch(`/trail_details/${geohash}.json`).then(results => results.json()).then(json => {
            setData(json)
        })
        return null
    }

    console.log(data)
    return <>{data["title"]}</>
}
