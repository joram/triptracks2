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

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <TopNav/>
      <Switch>

        {/* TRAILS */}
        <Route path="/trail/:geohash"><TrailDetails/></Route>
        <Route path="/trails"><Map /></Route>

        {/* PACKING */}
        <Route path="/packing/list"><PackingList/></Route>
        <Route path="/packing/create"><PackingCreate/></Route>
        <Route path="/packing/:id"><Packing/></Route>

        {/* PLAN */}
        <Route path="/plan/list"><TripPlanList/></Route>
        <Route path="/plan/create"><TripPlanCreate/></Route>
        <Route path="/plan/:id"><TripPlan/></Route>

        {/* DEFAULT */}
        <Route path="/"><Map /></Route>
      </Switch>
    </BrowserRouter>
    </div>
  );
}

export default App
