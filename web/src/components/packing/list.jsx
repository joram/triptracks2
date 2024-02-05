import React, {useContext, useEffect, useState} from "react";
import {Button, Container, Table} from "semantic-ui-react";
import {url} from "../../utils/auth";
import {Link} from "react-router-dom";
import {UserContext} from "../../App";

function PackingList(){
    let [loading, setLoading] = useState(false)
    let [packingLists, setPackingLists] = useState([])
    const { accessToken } = useContext(UserContext);

    useEffect(() => {
        if(loading){
            return
        }
        setLoading(true)


        async function getPackingLists() {
            console.log("getting packing lists with access token: ", accessToken)
            return await fetch(url("/api/v0/packing_lists"), {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Key': accessToken,
                },
            })
                .then(response => response.json())
                .then(packing_lists => {
                    console.log("packing_lists", packing_lists)
                    return packing_lists
                }).catch(exception => {
                    console.log("exception", exception)
                    return []
                })
        }

        getPackingLists().then(packing_lists => {
            setPackingLists(packing_lists)
        })
    }, [loading, accessToken])


    let rows = []
    rows.push(<Table.Row key="headers">
        <Table.HeaderCell>Name</Table.HeaderCell>
        <Table.HeaderCell># Items</Table.HeaderCell>
        {/*<Table.HeaderCell>Remove</Table.HeaderCell>*/}
    </Table.Row>)
    packingLists.map((packing_list, i) => {
        rows.push(<Table.Row key={"packing_list_"+i}>
            <Table.Cell><Link to={"/packing/"+packing_list.id}>{packing_list.name}</Link></Table.Cell>
            <Table.Cell>{packing_list.contents.length}</Table.Cell>
            {/*<Table.Cell><Button onClick={()=>{remove(packing_list.id)}}>Remove</Button></Table.Cell>*/}
        </Table.Row>)
        return ""
    })
    return <>
        <Container>
            <br/>
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