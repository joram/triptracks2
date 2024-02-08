import fleshOutTimeline from "./utils/timeline";
import React, {useEffect} from "react";
import moment from "moment/moment";
import {DraggableTable} from "./draggableTable";
import Row from "./itineraryTimelineRow";
import {Table} from "semantic-ui-react";


function makeRow(provided, data, setData, removeRow) {
    try {
        return <Row
            provided={provided}
            data={data}
            setData={setData}
            removeRow={removeRow}
        />
    } catch (error) {
        console.error(error)
        return <></>
    }
}

function makeRowHeader() {
    return <>
        <Table.HeaderCell collapsing>Icon</Table.HeaderCell>
        <Table.HeaderCell collapsing>Start Time</Table.HeaderCell>
        <Table.HeaderCell collapsing>Duration</Table.HeaderCell>
        <Table.HeaderCell>Time</Table.HeaderCell>
        <Table.HeaderCell>Description</Table.HeaderCell>
        <Table.HeaderCell collapsing>Actions</Table.HeaderCell>
    </>
}


function DayTimeline({day, timeline, setTimeline}) {

    function setRows(timeline){
        setTimeline(day, fleshOutTimeline(day, timeline))
    }

    useEffect(() => {
        let fleshedOutTimeline = fleshOutTimeline(day, timeline)
        setTimeline(day, fleshedOutTimeline)
    }, []);

    return <div>
        <h2>{moment(day).format("YYYY-MM-DD")}</h2>
        <DraggableTable
            rows={timeline}
            setRows={setRows}
            makeRowHeaderFunc={makeRowHeader}
            makeRowFunc={makeRow}
        />
    </div>
}

export default DayTimeline