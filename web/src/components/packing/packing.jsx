import React, {Component} from "react";
import {Grid} from "semantic-ui-react";
import ItemSearch from "./search";
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import DraggableTarget from "./draggableTarget";
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import {getAccessKey, url} from "../topNav"

async  function getPackingLists() {
    return await fetch(url("/api/v0/packing_lists"), {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Access-Key': getAccessKey(),
        },
    })
        .then(response => response.json())
        .then(packing_lists => {
            return packing_lists
        })
}

class Packing extends Component {
    state = {
        packing_lists: {
            Group: [],
            Personal: [],
        }
    }
    componentDidMount() {
        getPackingLists().then(packing_lists => {
            console.log(packing_lists)
            let state = this.state;
            state.packing_lists = packing_lists
            this.setState(state)
        })
    }

    render() {
        return <>
            <DndProvider backend={HTML5Backend}>
                <Grid columns={2}>
                    <Grid.Row>
                        <Grid.Column><ItemSearch data_url="/packing.search.mec.json"/></Grid.Column>
                        <Grid.Column>
                            <Tabs>
                                <TabList>
                                  <Tab>Group</Tab>
                                  <Tab>Personal</Tab>
                                </TabList>

                                <TabPanel>
                                  <DraggableTarget name="Group" accept={["item"]} items={this.state.packing_lists.Group}/>
                                </TabPanel>
                                <TabPanel>
                                  <DraggableTarget name="Personal" accept={["item"]} items={this.state.packing_lists.Personal}/>
                                </TabPanel>
                             </Tabs>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </DndProvider>
        </>
    }
}

export default Packing;