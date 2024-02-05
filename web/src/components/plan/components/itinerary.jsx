import React from "react";
import {Icon, Input, Label, Ref, Table} from "semantic-ui-react";
import {DraggableTable} from "./draggableTable";
import moment from 'moment';


function Row({provided, data, removeRow}) {
    let [isEditing, setIsEditing] = React.useState(false)

    let icon = <Icon {...provided.dragHandleProps} name='bars'/>
    if(data.icon !== undefined){
        icon = <Label {...provided.dragHandleProps} ribbon>
            <Icon name={data.icon} />
        </Label>
    }

    let startTime = data.startTime
    if(isEditing){
        startTime = <Input type="time" />
    }

    let duration = data.duration
    if(isEditing){
        duration = <Input type="time"/>
    }
    let description = data.description
    if(isEditing){
        description = <input type="text" value={description} onChange={(e) => {
            data.description = e.target.value
        }}/>
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
function makeRow(provided, data, removeRow) {
    return <Row provided={provided} data={data} removeRow={removeRow}/>
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


function fleshOutTimeline(date, timeline){
    let [year, month, day] = date.split("-")
    year = parseInt(year)
    month = parseInt(month)
    day = parseInt(day)
    let lastEndTime = new Date(year, month, day, 0, 0, 0, 0)  // midnight

    let newTimeline = timeline.map((item, index) => {
        item.inferred = {
            startTime: false,
            endTime: false,
            durationMinutes: false,
        }

        if(item.startTime === undefined){
            item.inferred.startTime = lastEndTime
        } else {
            item.inferred.startTime = item.startTime
            // convert startTime to a date object
            if(!(item.startTime instanceof Date)){
                console.log(item)
                let [hours, minutes] = item.inferred.startTime.split(":")
                hours = parseInt(hours)
                minutes = parseInt(minutes)
                item.inferred.startTime = new Date(year, month, day, hours, minutes, 0, 0)
            }
        }


        if(item.endTime === undefined && item.duration === undefined){
            item.inferred.endTime = item.inferred.startTime
            item.inferred.durationMinutes = 0
        }

        if(item.duration !== undefined){
            let [durationHours, durationMinutes] = item.duration.split(":")
            let totalDurationMinutes = parseInt(durationHours) * 60 + parseInt(durationMinutes)
            item.inferred.durationMinutes = totalDurationMinutes
            let endDt = moment(item.inferred.startTime).add(totalDurationMinutes, 'minutes').toDate()
            console.log(`adding ${totalDurationMinutes} minutes to ${item.inferred.startTime} to get ${endDt}`)

            item.inferred.endTime = endDt
            lastEndTime = endDt
        }

        const startStr = moment(item.inferred.startTime).format("HH:mm")
        const endStr = moment(item.inferred.endTime).format("HH:mm")
        item.inferred.timeString = `${startStr} - ${endStr} (${item.inferred.durationMinutes+" min" || 'unknown'})`

        lastEndTime = item.inferred.endTime
        return item
    })
    return newTimeline
}


function DayTimeline({day, timeline, setTimeline}) {
    return <div>
        <h2>{day}</h2>
        <DraggableTable
            rows={timeline}
            setRows={setTimeline}
            makeRowHeaderFunc={makeRowHeader}
            makeRowFunc={makeRow}
        />
    </div>
}

function Itinerary({itinerary, setItinerary}) {
    let itineraryDays = []
    itinerary.forEach((itineraryDay) => {
      itineraryDays.push(<DayTimeline
          day={itineraryDay.date}
          timeline={fleshOutTimeline(itineraryDay.date, itineraryDay.timeline)}
          setTimeline={(newTimeline) => {
              const newItinerary = Object.assign([], itinerary);
              newItinerary.forEach((day) => {
                    if(day.date === itineraryDay.date){
                        day.timeline = newTimeline
                    }
              })
              setItinerary(newItinerary);
          }}
      />)
    })

    return <>
        <h1>Itinerary</h1>
        {itineraryDays}
    </>
}

export default Itinerary;
