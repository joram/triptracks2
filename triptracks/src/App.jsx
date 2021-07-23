import './App.css';
import Map from "./components/Map";
import 'semantic-ui-css/semantic.min.css'
import {BrowserRouter, Route, Switch} from "react-router-dom";
import TrailDetails from "./components/TrailDetails";
import {Container, Header, Image, Menu, Segment} from "semantic-ui-react";
import TrailsSearch from "./components/TrailsSearch";

const TopNav = ({ fixed }) => (
    <Segment
      inverted
      textAlign='center'
      style={{ padding: '0em 0em' }}
      vertical
    >
      <Menu
        fixed={fixed ? 'top' : null}
        inverted={!fixed}
        pointing={!fixed}
        secondary={!fixed}
        size='large'
      >
        <Container>
          <Menu.Item style={{backgroundColor:"darkgreen"}}><Header inverted><Image src="/icon.png"/>Triptracks</Header></Menu.Item>
          <Menu.Item as='a' active>Trails</Menu.Item>
          <Menu.Item position="right">
              <TrailsSearch/>
              {/*<RouteSearchBox/>*/}
          </Menu.Item>
        </Container>
      </Menu>
    </Segment>
)


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <TopNav></TopNav>
      <Switch>

        <Route path="/trail/:geohash">
          <TrailDetails/>
        </Route>
        <Route path="/">
          <Map />
        </Route>
      </Switch>
    </BrowserRouter>
    </div>
  );
}

export default App
