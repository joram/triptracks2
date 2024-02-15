import React from "react";
import {Button, ButtonGroup, Icon, Input, Label, Modal, Ref, Table} from "semantic-ui-react";
import moment from "moment/moment";

function Row({provided, data, setData, removeRow}) {
    const inferredStartTime = new Date(data.startTime || data?.inferred?.startTime)
    let [startTime, setStartTime] = React.useState(inferredStartTime)
    let [duration, setDuration] = React.useState(data.durationMinutes)
    let [description, setDescription] = React.useState(data.description)

    let [editing, setEditing] = React.useState(false)
    let [explicitStartTime, setExplicitStartTime] = React.useState(data.startTime !== undefined)
    let [editingStartTime, setEditingStartTime] = React.useState(startTime)
    let [editingDuration, setEditingDuration] = React.useState(duration)
    let [editingDescription, setEditingDescription] = React.useState(description)


    let icon = <Icon {...provided.dragHandleProps} name='bars'/>
    if(data.icon !== undefined){
        icon = <Label {...provided.dragHandleProps} ribbon>
            <Icon name={data.icon} />
        </Label>
    }


    let icons = <>
        <Icon name='edit' onClick={() => {
            setEditing(true)
        }} />
        <Icon name='delete' onClick={() => {
            removeRow(data.id)
        }}/>
    </>
    if (data.editable === false){
        icons = <></>
    }

    let timeInput = <Input
        label='Start Time'
        type='time'
        value={moment(editingStartTime).format("HH:mm")}
        onChange={(e) => {
            let [hr, min] = e.target.value.split(":")
            hr = parseInt(hr)
            min = parseInt(min)
            editingStartTime.setHours(hr)
            editingStartTime.setMinutes(min)
            console.log("newDt", editingStartTime)
            setEditingStartTime(editingStartTime)
        }}
    />
    if(!explicitStartTime){
        timeInput = <Input
            label='Duration'
            type='number'
            value={editingDuration}
            onChange={(e) => {
                setEditingDuration(e.target.value)
            }}
        />
    }
    return <>
        <Modal
            open={editing}
        >
            <Modal.Header>Edit Itinerary Row</Modal.Header>
            <Modal.Content>
                <Modal.Description>
                    <ButtonGroup>
                        <Button active={explicitStartTime}  onClick={()=>{setExplicitStartTime(true)}}>Start Time</Button>
                        <Button active={!explicitStartTime} onClick={()=>{setExplicitStartTime(false)}}>Duration</Button>
                    </ButtonGroup>
                    <br/>
                    <br/>
                    {timeInput}
                    <br/>
                    <br/>
                    <Input
                        label='Description'
                        value={editingDescription}
                        onChange={(e) => {
                            setEditingDescription(e.target.value)
                        }}
                    />
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <ButtonGroup>
                    <Button primary onClick={
                        () => {
                            let newData = {
                                id: data.id,
                                startTime: explicitStartTime ? editingStartTime : undefined,
                                durationMinutes: explicitStartTime ? undefined : parseInt(editingDuration),
                                description: editingDescription,
                                icon: data.icon,
                                editable: data.editable,
                            }
                            setData(newData)
                            setEditing(false)
                        }
                    }>
                        Save
                    </Button>
                    <Button secondary onClick={() => {setEditing(false)}}>
                        Cancel
                    </Button>
                </ButtonGroup>
            </Modal.Actions>
        </Modal>
        <Ref key={""+data.id} innerRef={provided.innerRef}>
            <Table.Row
                {...provided.draggableProps}
            >
                <Table.Cell>
                    {icon}
                </Table.Cell>
                <Table.Cell>
                    {moment(startTime).format("HH:mm")}
                </Table.Cell>
                <Table.Cell>
                    {editingDuration}
                </Table.Cell>
                <Table.Cell>
                    {data?.inferred?.timeString || "???"}
                </Table.Cell>
                <Table.Cell>
                    {editingDescription}
                </Table.Cell>
                <Table.Cell>
                    {icons}
                </Table.Cell>
            </Table.Row>
        </Ref>
    </>
}


export default Row
