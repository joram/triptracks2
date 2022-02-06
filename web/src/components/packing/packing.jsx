import React, {useState} from "react";
import {Grid, Segment} from "semantic-ui-react";
import ItemSearch from "./search";
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import DraggableTarget from "./draggableTarget";
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
        <DndProvider backend={HTML5Backend}>
            <Segment>
                <Grid columns={2}>
                    <Grid.Row>
                        <Grid.Column><ItemSearch data_url="/packing.search.mec.json"/></Grid.Column>
                        <Grid.Column>
                            <DraggableTarget
                                name={packing_list.name}
                                accept={["item"]}
                                items={packing_list.contents}
                                id={id}
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        </DndProvider>
    </>
}

export default Packing;