import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import {Button, Ref, Table} from "semantic-ui-react";
import React from "react";

// https://codesandbox.io/p/sandbox/84vz99mxn9?file=%2Fsrc%2Findex.js%3A114%2C17

export function DraggableTable({rows, setRows, makeRowHeaderFunc, makeRowFunc}) {

    // add IDs
    rows.forEach((row, index) => {
        rows[index].id = index
    })

    function addRow() {
        let maxId = 0
        rows.forEach(row => {
            if(row.id > maxId){
                maxId = row.id
            }
        })

        const newRow = {
            id: maxId+1,
            description: ""
        }
        console.log("adding row", newRow)
        setRows([...rows, newRow])
    }

    function updateRow(data) {
        const newRows = []
        rows.forEach(row => {
            if(row.id === data.id){
                newRows.push(data)
            } else {
                newRows.push(row)
            }
        })
        console.log("updating row", newRows)
        setRows(newRows)
    }

    function removeRow(id) {
        const newRows = rows.filter((row, index) => {
            return row.id !== id
        })
        setRows(newRows)
    }
    function onDragEnd(result) {
        const {destination, source} = result;

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newRows = Object.assign([], rows);
        const row = newRows[source.index];
        newRows.splice(source.index, 1);
        newRows.splice(destination.index, 0, row);

        console.log("new order", newRows)
        setRows(newRows)
    }

    return <DragDropContext onDragEnd={onDragEnd}>
        <Table>
            <Table.Header>
                <Table.Row>
                    {makeRowHeaderFunc()}
                </Table.Row>
            </Table.Header>
            <Droppable droppableId="tableBody">
                {(provided, snapshot) => (
                    <Ref innerRef={provided.innerRef}>
                        <Table.Body {...provided.droppableProps}>
                            {rows.map((row, index) => {
                                return <Draggable
                                    draggableId={"" + row.id}
                                    index={row.id}
                                    key={row.id+row.description}
                                >
                                    {(provided, snapshot) => ( makeRowFunc(provided, row, updateRow, removeRow) )}
                                </Draggable>
                            })}
                            <Table.Row>
                                <Table.Cell colSpan="6" textAlign="center">
                                    <Button content="add row" onClick={addRow}/>
                                </Table.Cell>
                            </Table.Row>
                            {provided.placeholder}
                        </Table.Body>
                    </Ref>
                )}
            </Droppable>
        </Table>
    </DragDropContext>

}