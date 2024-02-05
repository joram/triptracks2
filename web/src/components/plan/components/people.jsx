import {Button, Card, CardGroup, Image, Segment} from "semantic-ui-react";
import React from "react";

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

    return <Card>
        <Image src={image}/>
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

export function People({people, setPeople}) {

    function removePerson(person) {
        let newPeople = people.slice()
        newPeople.splice(newPeople.indexOf(person), 1)
        setPeople(newPeople)
    }


    let cards = [];
    if (people !== null) {
        cards = people.map((person, i) => {
            return <Person person={person} removePerson={removePerson} key={"person_" + i}/>

        })
    }

    return <Segment basic>
        <CardGroup itemsPerRow={4} stackable centered>
            {cards}
        </CardGroup>
    </Segment>
}