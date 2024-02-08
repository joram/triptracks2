import React from "react";
import {Icon, Input, Label, Ref, Table} from "semantic-ui-react";
import moment from "moment/moment";

function Row({provided, data, setData, removeRow}) {
    let [startTime, setStartTime] = React.useState(new Date(data.startTime))
    let [duration, setDuration] = React.useState(data.duration)
    let [description, setDescription] = React.useState(data.description)


    let icon = <Icon {...provided.dragHandleProps} name='bars'/>
    if(data.icon !== undefined){
        icon = <Label {...provided.dragHandleProps} ribbon>
            <Icon name={data.icon} />
        </Label>
    }


    let icons = <>
        <Icon name='edit' />
        <Icon name='delete' onClick={() => {
            removeRow(data.id)
        }}/>
    </>
    return <>
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
