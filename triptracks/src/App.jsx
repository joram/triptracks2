import './App.css';
import React, {Component} from 'react';
import Trails from "./Trails";

class App extends Component {

  render() {
    return (
      <div className="App">
        <Trails
            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyAntpb0h6GbbKCowtWxK6kes6RCxEQv7o0"
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div  className="fullscreen" />}
            mapElement={<div style={{ height: `100%` }} />}
        />

      </div>
    );
  }
}

export default App;
