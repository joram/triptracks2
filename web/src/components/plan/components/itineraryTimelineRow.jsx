import React from "react";
import {Button, ButtonGroup, Icon, Input, Label, Modal, Ref, Table} from "semantic-ui-react";
import moment from "moment/moment";

function Row({provided, data, setData, removeRow}) {
    let [startTime, setStartTime] = React.useState(new Date(data.inferred.startTime))
    let [duration, setDuration] = React.useState(data.duration)
    let [description, setDescription] = React.useState(data.description)

    let [editing, setEditing] = React.useState(false)
    let [explicitStartTime, setExplicitStartTime] = React.useState(data.startTime !== undefined)
    let [editingStartTime, setEditingStartTime] = React.useState(startTime)


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

    let timeInput = <Input
        label='Start Time'
        type='time'
        value={moment(editingStartTime).format("HH:mm")}
        onChange={(e) => {
            setEditingStartTime(new Date(e.target.value))
        }}
    />
    if(!explicitStartTime){
        timeInput = <Input
            label='Duration'
            type='number'
            value={duration}
            onChange={(e) => {
                setDuration(e.target.value)
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
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value)
                        }}
                    />
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <ButtonGroup>
                    <Button primary>
                        Save
                    </Button>
                    <Button secondary>
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


export default Row
