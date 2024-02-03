import './App.css';
import Map from "./components/trails/Map";
import 'semantic-ui-css/semantic.min.css'
import {BrowserRouter, Route, Switch} from "react-router-dom";
import TrailDetails from "./components/trails/TrailDetails";
import {TopNav} from "./components/topNav";
import PackingList from "./components/packing/list";
import PackingCreate from "./components/packing/create";
import Packing from "./components/packing/packing";
import TripPlanList from "./components/plan/list";
import TripPlanCreate from "./components/plan/create";
import Plan from "./components/plan/plan";
import React, {useState} from "react";
import Home from "./components/home";
import Partners from "./components/partners/partners";
import Login from "./components/login";
import Cookies from "universal-cookie/es6";
import {Segment} from "semantic-ui-react";
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export const UserContext = React.createContext(null);
const cookies = new Cookies();

function App() {
  const [user, setUser] = useState(cookies.get('user', { path: '/', domain: window.location.hostname }));
  const [accessToken, setAccessToken] = useState(cookies.get('accessToken', { path: '/',domain: window.location.hostname }));

  function setUserPropAndCookie(newUser){

    setUser(newUser)
    cookies.set('user', newUser, { path: '/', domain: window.location.hostname });
    if(newUser === null || newUser === undefined){
      cookies.remove('user', { path: '/',domain: window.location.hostname});
      setUser(null)
      console.log("removed user cookie")
    }
  }

  function setAccessTokenPropAndCookie(newAccessToken){
    setAccessToken(newAccessToken)
    cookies.set('accessToken', newAccessToken, { path: '/',domain: window.location.hostname });
    if(newAccessToken === null || newAccessToken === undefined){
      cookies.remove('accessToken', { path: '/',domain: window.location.hostname });
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
          <ToastContainer />
          <Segment vertical style={{ margin: '0em 0em 0em', padding: '5em 0em' }}>
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
              <Route path="/plans/list"><TripPlanList/></Route>
              <Route path="/plan/create"><TripPlanCreate/></Route>
              <Route path="/plan/:id"><Plan/></Route>

              {/* DEFAULT */}
              <Route path="/login"><Login/></Route>
              <Route path="/"><Home/></Route>
            </Switch>

          </Segment>

        </UserContext.Provider>
      </BrowserRouter>
    </div>
  );
}

export default App
