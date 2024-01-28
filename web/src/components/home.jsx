import {Card, Confirm, Container, Header, Icon, Segment} from "semantic-ui-react";

function Home() {
  return (
      <Container>
          <br/>
          <Header as='h1'>Welcome to Triptracks</Header>
            <Segment basic>
                <p>
                    TripTracks is a tool for planning and sharing your outdoor adventures.
                    It's a work in progress, but you can already use it to:
                </p>
            </Segment>
          <Card.Group itemsPerRow={4} stackable>
              <Card>
                  <Card.Content>
                      <Card.Header>Trails</Card.Header>
                      <Card.Meta>Browse Routes and Trails</Card.Meta>
                      <Card.Description>
                          <Icon name='map signs' size="huge"/>
                      </Card.Description>
                  </Card.Content>
              </Card>

              <Card>
                  <Card.Content>
                      <Card.Header>Packing</Card.Header>
                      <Card.Meta>Build and share what's in your pack</Card.Meta>
                      <Card.Description>
                          <Icon name='calendar minus' size="huge"/>
                      </Card.Description>
                  </Card.Content>
              </Card>

              <Card>
                  <Card.Content>
                      <Card.Header>Partners</Card.Header>
                      <Card.Meta>Manage your list of outdoor friends</Card.Meta>
                      <Card.Description>
                          <Icon name='group' size="huge"/>
                      </Card.Description>
                  </Card.Content>
              </Card>

              <Card>
                  <Card.Content>
                      <Card.Header>Planning</Card.Header>
                      <Card.Meta>Write out your trip plan</Card.Meta>
                      <Card.Description>
                          <Icon name='calendar' size="huge"/>
                      </Card.Description>
                  </Card.Content>
              </Card>
          </Card.Group>

      </Container>
  );
}

export default Home;