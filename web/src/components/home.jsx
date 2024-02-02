import {Card, Container, Header, Icon, Image, Segment} from "semantic-ui-react";
import {Link} from "react-router-dom";


function Home() {
  return (
      <Container>
          <br/>
          <Header as='h1'>Welcome to Triptracks</Header>
          <Image size="small" centered src="/logo.svg"/>
            <Segment basic>
                <p>
                    Triptracks is a tool for planning and sharing your outdoor adventures.
                    It's a work in progress, but you can already use it to manage:
                </p>
            </Segment>
          <Segment basic>
              <Card.Group itemsPerRow={4} stackable>
                  <Card as={Link} to="/trails">
                      <Card.Content>
                          <Card.Header>Trails</Card.Header>
                          <Card.Meta>Browse Routes and Trails</Card.Meta>
                          <Card.Description>
                              <Icon name='map signs' size="huge"/>
                          </Card.Description>
                      </Card.Content>
                  </Card>

                  <Card as={Link} to="/packing/list">
                      <Card.Content>
                          <Card.Header>Packing</Card.Header>
                          <Card.Meta>Build and share what's in your pack</Card.Meta>
                          <Card.Description>
                              <Icon name='calendar minus' size="huge"/>
                          </Card.Description>
                      </Card.Content>
                  </Card>

                  <Card as={Link} to="/partners">
                      <Card.Content>
                          <Card.Header>Partners</Card.Header>
                          <Card.Meta>Manage your list of outdoor friends</Card.Meta>
                          <Card.Description>
                              <Icon name='group' size="huge"/>
                          </Card.Description>
                      </Card.Content>
                  </Card>

                  <Card as={Link} to="/plans/list">
                      <Card.Content>
                          <Card.Header>Planning</Card.Header>
                          <Card.Meta>Write out your trip plan</Card.Meta>
                          <Card.Description>
                              <Icon name='calendar alternate outline' size="huge"/>
                          </Card.Description>
                      </Card.Content>
                  </Card>
              </Card.Group>
          </Segment>

      </Container>
  );
}

export default Home;