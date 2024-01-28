import React, {useEffect, useState} from "react";
import {Button, Container, Table} from "semantic-ui-react";
import {handleApiErrors, url} from "../topNav";
import {Link} from "react-router-dom";
import {getAccessKey} from "../../utils/auth";

function PackingList({isLoggedIn}){
    let [packingLists, setPackingLists] = useState([])

    useEffect(() => {
        getPackingLists().then(packing_lists => {
            setPackingLists(packing_lists)
        })
    }, []);


    async function getPackingLists() {
        return await fetch(url("/api/v0/packing_lists"), {
            method: "GET",
            headers: {
                'Access-Control-Allow-Origin':'triptracks2.oram.ca',
                'Content-Type': 'application/json',
                'Access-Key': getAccessKey(),
            },
        })
            .then(response => response.json())
            .then(packing_lists => {
                handleApiErrors(packing_lists)
                if(packing_lists.detail !== undefined){
                    return []
                }
                return packing_lists
            }).catch(exception => {
                console.log("exception", exception)
                return []
            })
    }

    async function removePackingList(packing_list_id) {
        return await fetch(url("/api/v0/packing_list/"+packing_list_id), {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'Access-Key': getAccessKey(),
            },
            body: "{}"
        }).then(response => {
            let newPackingLists = packingLists.filter(packing_list => {
                return packing_list.id !== packing_list_id
            })
            setPackingLists(newPackingLists)
        })
    }

    function remove(id){
        removePackingList(id).then(()=> {
            getPackingLists().then(packing_lists => {
                setPackingLists(packing_lists)
            })
        })
    }


    let rows = []
    rows.push(<Table.Row key="headers">
        <Table.HeaderCell>Name</Table.HeaderCell>
        <Table.HeaderCell># Items</Table.HeaderCell>
        <Table.HeaderCell>Remove</Table.HeaderCell>
    </Table.Row>)
    packingLists.map((packing_list, i) => {
        rows.push(<Table.Row key={"packing_list_"+i}>
            <Table.Cell><Link to={"/packing/"+packing_list.id}>{packing_list.name}</Link></Table.Cell>
            <Table.Cell>{packing_list.contents.length}</Table.Cell>
            <Table.Cell><Button onClick={()=>{remove(packing_list.id)}}>Remove</Button></Table.Cell>
        </Table.Row>)
        return ""
    })
    return <>
        <Container>
            <Table celled striped>
                <Table.Body>
                    {rows}
                </Table.Body>
            </Table>
            <Button as={Link} to="/packing/create">Create New Packing List</Button>
        </Container>
    </>
}

export default PackingList;