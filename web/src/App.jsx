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
import React, {useState} from "react";
import Home from "./components/home";
import Partners from "./components/partners/partners";
import Login from "./components/login";
import Cookies from "universal-cookie/es6";

export const UserContext = React.createContext(null);
const cookies = new Cookies();

function App() {
  const [user, setUserProp] = useState(cookies.get('user'));
  const [accessToken, setAccessTokenProp] = useState(cookies.get('accessToken'));

  function setUser(newUser){
    setUserProp(newUser)
    cookies.set('user', newUser, { path: '/' });
    if(newUser === null){
      cookies.remove('user');
    }
  }

  function setAccessToken(newAccessToken){
    setAccessTokenProp(newAccessToken)
    cookies.set('accessToken', newAccessToken, { path: '/' });
    if(newAccessToken === null){
      cookies.remove('accessToken');
    }
  }

  return (
    <div className="App">
      <BrowserRouter>
        <UserContext.Provider value={{
          user: user,
          setUser: setUser,
          accessToken: accessToken,
          setAccessToken: setAccessToken
        }}>
          <TopNav/>
          <Switch>

            {/* TRAILS */}
            <Route path="/trail/:geohash"><TrailDetails/></Route>
            <Route path="/trails"><Map /></Route>

            {/* PACKING */}
            <Route path="/packing/list"><PackingList/></Route>
            <Route path="/packing/create"><PackingCreate/></Route>
            <Route path="/packing/:id"><Packing/></Route>

            {/* PARTNERS */}
            <Route path="/partners"><Partners/></Route>

            {/* PLAN */}
            <Route path="/plan/list"><TripPlanList/></Route>
            <Route path="/plan/create"><TripPlanCreate/></Route>
            <Route path="/plan/:id"><TripPlan/></Route>

            {/* DEFAULT */}
            <Route path="/login"><Login/></Route>
            <Route path="/"><Home/></Route>
          </Switch>
        </UserContext.Provider>
      </BrowserRouter>
    </div>
  );
}

export default App
