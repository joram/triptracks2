import React, {Component} from "react";
import {Grid} from "semantic-ui-react";
import ItemSearch from "./search";
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import DraggableTarget from "./draggableTarget";

class Packing extends Component {
    render() {
        return <>
            <Grid columns={3}>
                <Grid.Row>
                    <DndProvider backend={HTML5Backend}>
                        <Grid.Column><ItemSearch data_url="/packing.search.mec.json"/></Grid.Column>
                        <Grid.Column><DraggableTarget name="Group" accept={["item"]}/></Grid.Column>
                        <Grid.Column><DraggableTarget name="Personal" accept={["item"]}/></Grid.Column>
                    </DndProvider>
                </Grid.Row>
            </Grid>
        </>
    }
}

export default Packing;