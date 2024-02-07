import React, {useEffect} from "react";
import {Icon, Input, Label, Ref, Table} from "semantic-ui-react";
import {DraggableTable} from "./draggableTable";
import moment from 'moment';
import fleshOutTimeline from "./utils/timeline";
import dedupeItinerary from "./utils/itinerary";


function Row({provided, data, setData, removeRow}) {
    let [isEditing, setIsEditing] = React.useState(false)

    let icon = <Icon {...provided.dragHandleProps} name='bars'/>
    if(data.icon !== undefined){
        icon = <Label {...provided.dragHandleProps} ribbon>
            <Icon name={data.icon} />
        </Label>
    }

    let startTime = moment(new Date(data.startTime)).format("HH:mm")
    if(isEditing){
        startTime = <Input type="time" />
    }

    let duration = data.duration
    if(isEditing){
        duration = <Input type="time"/>
    }
    let description = data.description
    if(isEditing){
        description = <input
            type="text"
            value={description}
            onChange={
            (e) => {
                data.description = e.target.value
                setData(data)
            }}
        />
    }

    let deleteIcon = null
    if(isEditing){
        deleteIcon = <Icon name='delete' onClick={() => {
            setIsEditing(false)
            removeRow(data.id)
        }}/>
    }

    let saveIcon = null
    if(isEditing){
        saveIcon = <Icon name='save' onClick={() => {
            setIsEditing(false)
        }}/>
    }

    let editIcon = null
    if(!isEditing){
        editIcon = <Icon name='edit' onClick={() => {
            setIsEditing(true)
        }}/>
    }

    let icons = <>{editIcon}</>
    if(isEditing){
        icons = <>{deleteIcon}{saveIcon}</>
    }
    return <>
        <Ref key={""+data.id} innerRef={provided.innerRef}>
            <Table.Row
                {...provided.draggableProps}
            >
                <Table.Cell>
                    {icon}
                </Table.Cell>
                <Table.Cell>
                    {startTime}
                </Table.Cell>
                <Table.Cell>
                    {duration}
                </Table.Cell>
                <Table.Cell>
                    {data.inferred.timeString}
                </Table.Cell>
                <Table.Cell>
                    {description}
                </Table.Cell>
                <Table.Cell>
                    {icons}
                </Table.Cell>
            </Table.Row>
        </Ref>
    </>
}
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
        setTimeline(day, fleshOutTimeline(day, timeline, null))
    }

    useEffect(() => {
        let fleshedOutTimeline = fleshOutTimeline(day, timeline, null)
        console.log("fleshedOutTimeline", fleshedOutTimeline)
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

function Itinerary({itinerary, setItinerary}) {

    useEffect(() => {
        const newItinerary = dedupeItinerary(itinerary)
        if(newItinerary.length !== itinerary.length){
            setItinerary(newItinerary)
        }
    }, [itinerary, setItinerary])

    if(itinerary === null){
        return <></>
    }

    function setNewTimeline(date, newTimeline){
        try {
            date = new Date(date)

            function dateToString(date) {
                return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
            }

            let newItinerary = []
            itinerary.forEach(day => {
                if (dateToString(day.date) === dateToString(date)) {
                    day.timeline = newTimeline
                }
                newItinerary.push(day)
            })
            setItinerary(newItinerary);
        } catch (error) {
            console.error(error)
        }
    }

    let itineraryDays = []
    itinerary.forEach((itineraryDay) => {
      itineraryDays.push(<DayTimeline
          key={itineraryDay.date}
          day={itineraryDay.date}
          timeline={itineraryDay.timeline}
          setTimeline={setNewTimeline}
      />)
    })

    return <>
        <h1>Itinerary</h1>
        {itineraryDays}
    </>
}

export default Itinerary;
