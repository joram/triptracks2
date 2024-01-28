import './App.css';
import Map from "./components/trails/Map";
import 'semantic-ui-css/semantic.min.css'
import {BrowserRouter, Route, Switch} from "react-router-dom";
import TrailDetails from "./components/trails/TrailDetails";
import {TopNav} from "./components/topNav";
import PackingList from "./components/packing/list";
import PackingCreate from "./components/packing/create";
import Packing from "./components/packing/packing";
import TripPlanList from "./components/trip_plan/list";
import TripPlanCreate from "./components/trip_plan/create";
import TripPlan from "./components/trip_plan/trip_plan";
import {useState} from "react";
import Home from "./components/home";

function App() {
  let [loggedIn, setIsLoggedIn] = useState(false)
  function onLoginChange(loggedIn){
    setIsLoggedIn(loggedIn)
    window.location.reload(true);
  }

  return (
    <div className="App">
      <BrowserRouter>
        <TopNav onLoginChange={onLoginChange}/>
        <Switch>

          {/* TRAILS */}
          <Route path="/trail/:geohash"><TrailDetails/></Route>
          <Route path="/trails"><Map /></Route>

          {/* PACKING */}
          <Route path="/packing/list"><PackingList loggedIn={loggedIn}/></Route>
          <Route path="/packing/create"><PackingCreate loggedIn={loggedIn}/></Route>
          <Route path="/packing/:id"><Packing loggedIn={loggedIn}/></Route>

          {/* PLAN */}
          <Route path="/plan/list"><TripPlanList/></Route>
          <Route path="/plan/create"><TripPlanCreate/></Route>
          <Route path="/plan/:id"><TripPlan/></Route>

          {/* DEFAULT */}
          <Route path="/"><Home /></Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App
