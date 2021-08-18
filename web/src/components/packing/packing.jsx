import React, {Component} from "react";
import {Grid} from "semantic-ui-react";
import ItemSearch from "./search";
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import DraggableTarget from "./draggableTarget";
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';
import 'react-tabs/style/react-tabs.css';


class Packing extends Component {
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
                                  <DraggableTarget name="Group" accept={["item"]}/>
                                </TabPanel>
                                <TabPanel>
                                  <DraggableTarget name="Personal" accept={["item"]}/>
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