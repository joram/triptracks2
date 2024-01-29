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
  const [user, setUser] = useState(cookies.get('user', { path: '/' }));
  const [accessToken, setAccessToken] = useState(cookies.get('accessToken', { path: '/' }));

  function setUserPropAndCookie(newUser){

    setUser(newUser)
    cookies.set('user', newUser, { path: '/' });
    if(newUser === null || newUser === undefined){
      cookies.remove('user', { path: '/' });
      setUser(null)
      console.log("removed user cookie")
    }
  }

  function setAccessTokenPropAndCookie(newAccessToken){
    setAccessToken(newAccessToken)
    cookies.set('accessToken', newAccessToken, { path: '/' });
    if(newAccessToken === null || newAccessToken === undefined){
      cookies.remove('accessToken', { path: '/' });
      setAccessToken(null)
      console.log("removed access token cookie")
    }
  }

  return (
    <div className="App">
      <BrowserRouter>
        <UserContext.Provider value={{
          user: user,
          'setUser': setUserPropAndCookie,
          accessToken: accessToken,
          'setAccessToken': setAccessTokenPropAndCookie,
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
