import React, {useState} from "react";
import {useParams} from 'react-router-dom'
import {handleApiErrors, url} from "../topNav";
import {AccessKeyContext} from "../../utils/context";

async function getPackingList(id){
  let accessKey = AccessKeyContext.accessKey
  return fetch(url("/api/v0/packing_list/"+id), {
      method: "GET",
      headers: {
          'Content-Type': 'application/json',
          'Access-Key': accessKey,
      },
  }).then(response => {
      return response.json()
  }).then(response => {
      handleApiErrors(response)
      return response
  })
}


function Packing () {
    let [packing_list, setPackingList] = useState({Group: []})
    let [fetched, setFetched] = useState(false)
    let {id} = useParams()

    if(!fetched){
        getPackingList(id).then(packing_list => {
            setFetched(true)
            setPackingList(packing_list)
        })
    }

    return <>

    </>
}

export default Packing;