import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import {Button, Ref, Table} from "semantic-ui-react";
import React from "react";
import {toast} from "react-toastify";

// https://codesandbox.io/p/sandbox/84vz99mxn9?file=%2Fsrc%2Findex.js%3A114%2C17

export function DraggableTable({rows, setRows, makeRowHeaderFunc, makeRowFunc}) {

    // sanity check
    const seenIds = []
    rows.forEach((row, index) => {
        if(seenIds.includes(row.id)){
            toast("duplicate id in rows")
            throw new Error("duplicate id in rows")
        }
        seenIds.push(row.id)
    })

    function addRow() {
        let maxId = 0
        rows.forEach((row, index) => {
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
        const newRows = rows.map((row, index) => {
            if(row.id === data.id){
                return data
            }
            return row
        })
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
                                    index={index}
                                    key={row.id}
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