import {Button, Card, Container, Header, Image, Input, Modal} from "semantic-ui-react";
import React, {useContext, useEffect, useState} from "react";
import {addPartner, getPartners, removePartner} from "../../utils/api";
import {UserContext} from "../../App";
import Gravatar from 'react-gravatar'

function AddPartnerForm({email, setEmail}) {
    return (
        <Container>
            <Input type="email" label="email" value={email} onChange={(e) => {
                setEmail(e.target.value)
            }}/>
        </Container>
    );
}


function Person({person, removePerson}) {
    const defaultImage = "https://react.semantic-ui.com/images/avatar/large/matthew.png"
    let name = "Unknown"
    let image = defaultImage
    if (typeof person === "string") {
        name = person
    } else {
        name = person.google_info.name
        image = person?.google_info?.picture || defaultImage
    }

    let img = <Image src={image}/>
    if (person.email !== undefined && person.email !== null) {
        img = <Gravatar email={person.email} size={290} default="mp" />
    }
    return <Card>
        {img}
        <Card.Content>
            <Card.Header>{name}</Card.Header>
        </Card.Content>
        <Card.Meta>
            <Button icon={"remove"} onClick={() => {
                removePerson(person)
            }}/>
        </Card.Meta>
    </Card>

}

function List() {
    let [loading, setLoading] = useState(true)
    let [partners, setPartners] = useState([])
    let [addEmail, setAddEmail] = useState("")
    const { accessToken } = useContext(UserContext);

    useEffect(() => {
        getPartners(accessToken).then(response => {
            setPartners(response.data)
            setLoading(false)
        })
    }, []);

    function removePerson(person) {
        let newPeople = partners.slice()
        newPeople.splice(newPeople.indexOf(person), 1)
        removePartner(accessToken, person.partner_id).then(response => {
            getPartners(accessToken).then(response => {
                setPartners(response.data)
            })
        })
    }

    if (loading) {
        return (
            <Container>
                <Header as="h1">Loading...</Header>
            </Container>
        );
    }

    if (partners.length === 0) {
        return (
            <Container>
                <Header as="h1">No partners found</Header>
                <Modal
                    trigger={<Button>Add Partner</Button>}
                    header='Add Partner'
                    content={<AddPartnerForm email={addEmail} setEmail={setAddEmail}/>}
                    actions={['Cancel', { key: 'add', content: 'Done', positive: true }]}
                    onActionClick={() => {
                        addPartner(accessToken, addEmail).then(response => {
                            getPartners(accessToken).then(response => {
                                setPartners(response.data)
                            })
                        })
                    }}
                />
            </Container>
        );
    }

    return (
        <Container>
            <Header as="h1">Partners</Header>
            {partners.map((partner, i) => {
                return <Person
                    person={partner}
                    key={"partner_" + i}
                    removePerson={removePerson}
                />
            })}
        </Container>
    );
}

export default List;