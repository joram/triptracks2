import React, {Component} from "react";
import {Button, Container, Table} from "semantic-ui-react";
import {handleApiErrors, url} from "../topNav";
import {Link} from "react-router-dom";
import {AccessKeyContext, UserinfoContext} from "../../context";

async function getPackingLists() {
    let accessKey = AccessKeyContext.accessKey
    return await fetch(url("/api/v0/packing_lists"), {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Access-Key': accessKey,
        },
    })
        .then(response => response.json())
        .then(packing_lists => {
            handleApiErrors(packing_lists)
            if(packing_lists.detail !== undefined){
                return []
            }
            return packing_lists
        })
}

async function removePackingList(packing_list_id) {
    let accessKey = AccessKeyContext.accessKey
    return await fetch(url("/api/v0/packing_list/"+packing_list_id), {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Access-Key': accessKey,
        },
        body: "{}"
    })
}

function isLoggedIn(){
    let accessKey = AccessKeyContext.accessKey
    let userinfo = UserinfoContext.userinfo
    console.log("is logged in?", accessKey, userinfo)
    return (accessKey !== undefined && userinfo !== undefined)
}


class PackingList extends Component {
    state = {
        packing_lists: []
    }

    refreshList() {
        getPackingLists().then(packing_lists => {
            let state = this.state;
            state.packing_lists = packing_lists
            this.setState(state)
        })
    }

    componentDidMount() {
        if(isLoggedIn()){
            this.refreshList()
        }
    }

    removePackingList(id){
        removePackingList(id).then(()=> {
            this.refreshList()
        })
    }


    render() {
        if(!isLoggedIn()){
            return <Container>you must be logged in before you can create a packing list</Container>
        }
        let rows = []
        rows.push(<Table.Row key="headers">
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell># Items</Table.HeaderCell>
            <Table.HeaderCell>Weight</Table.HeaderCell>
            <Table.HeaderCell>Remove</Table.HeaderCell>
        </Table.Row>)
        this.state.packing_lists.map((packing_list, i) => {
            rows.push(<Table.Row key={"packing_list_"+i}>
                <Table.Cell><Link to={"/packing/"+packing_list.id}>{packing_list.name}</Link></Table.Cell>
                <Table.Cell>{packing_list.contents.length}</Table.Cell>
                <Table.Cell>{packing_list.weight/1000}kg</Table.Cell>
                <Table.Cell><Button onClick={()=>{this.removePackingList(packing_list.id)}}>Remove</Button></Table.Cell>
            </Table.Row>)
            return ""
        })
        return <>
            <Container>
                <Table celled striped>{rows}</Table>
                <Button as={Link} to="/packing/create">Create New Packing List</Button>
            </Container>
        </>
    }
}

export default PackingList;