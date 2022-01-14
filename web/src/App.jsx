import './App.css';
import Map from "./components/trails/Map";
import 'semantic-ui-css/semantic.min.css'
import {BrowserRouter, Route, Switch} from "react-router-dom";
import TrailDetails from "./components/trails/TrailDetails";
import Packing from "./components/packing/packing";
import {TopNav} from "./components/topNav";
import PackingList from "./components/packing/list";
import PackingCreate from "./components/packing/create";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <TopNav/>
      <Switch>
        <Route path="/packing/list">
            <PackingList/>
        </Route>
        <Route path="/packing/create">
            <PackingCreate/>
        </Route>
        <Route path="/packing/:id">
            <Packing/>
        </Route>
        <Route path="/trail/:geohash">
          <TrailDetails/>
        </Route>
        <Route path="/trails">
          <Map />
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
