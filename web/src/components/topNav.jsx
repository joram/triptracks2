import {Container, Dropdown, Header, Image, Menu, Segment} from "semantic-ui-react";
import TrailsSearch from "./trails/TrailsSearch";
import GoogleLogin, {GoogleLogout} from 'react-google-login';
import {Component} from "react";
import {Link} from "react-router-dom";

function url(path){
    let base = "https://triptracks2.oram.ca"
    if (process.env.REACT_APP_ENVIRONMENT==="local"){
        base = "http://localhost:8000"
    }
    return base+path
}


class AccountMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
          userinfo: null,
          accessKey: null,
          isLoggedIn: false
        }
      }

    loginSuccess(response) {
        fetch(url("/api/v0/access_key"), {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: response.tokenId,
          })
        }).then(response => {
            return response.json()
        }).then(access_key => {
          console.log("Request complete! response:", access_key)
          let state = this.state
          state.accessKey = access_key
          state.isLoggedIn = true
          this.setState(state)
          this.updateUserinfo()
        });
    }

    logoutSuccess(resp){
        console.log("logout success ", resp)
        let state = this.state
        state.accessKey = null
        state.userinfo = null
        state.isLoggedIn = false
        this.setState(state)
    }

    updateUserinfo(){
        fetch(url("/api/v0/userinfo"), {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Access-Key': this.state.accessKey,
            },
        }).then(response => {
            return response.json()
        }).then(userinfo => {
            if(userinfo["detail"] === "Access-Key header invalid"){
                this.logoutSuccess()
            }
            let state = this.state
            state.userinfo = userinfo
            this.setState(state);
        });
    }

    render() {
        console.log(this.state)
        if (this.state.isLoggedIn === false) {
            console.log("showing login button")
            return <div style={{
                marginTop: "15px",
                marginBottom: "15px",
            }}>
                <GoogleLogin
                    clientId="965794564715-ebal2dv5tdac3iloedmnnb9ph0lptibp.apps.googleusercontent.com"
                    buttonText="Login"
                    autoLoad={true}
                    onSuccess={this.loginSuccess.bind(this)}
                    cookiePolicy={'single_host_origin'}
                />
            </div>
        }

        let userinfo = this.state.userinfo
        if (userinfo !== null) {
            let link_style = {color: "black"}
            console.log(userinfo)
            let menuTitle = <Dropdown.Header style={{marginTop: "30px"}}>
                <Image avatar src={userinfo.picture}/>
                {userinfo.name}
            </Dropdown.Header>;
            return <Dropdown text={menuTitle}>
                <Dropdown.Menu>
                    <Dropdown.Item><Link to="/routes" style={link_style}>My Routes</Link></Dropdown.Item>
                    <Dropdown.Item><Link to="/plans" style={link_style}>My Plans</Link></Dropdown.Item>
                    <Dropdown.Item><Link to="/settings" style={link_style}>Settings</Link></Dropdown.Item>
                    <Dropdown.Item>
                        <GoogleLogout
                            buttonText="Logout"
                            onLogoutSuccess={this.logoutSuccess.bind(this)}
                            render={renderProps => (<div onClick={renderProps.onClick}>Logout</div>)}
                        />
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        }


        return <></>
    }
}

const TopNav = ({ fixed }) => {
    return <Segment
        inverted
        textAlign='center'
        style={{padding: '0em 0em'}}
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
                <Menu.Item style={{backgroundColor: "darkgreen"}}>
                    <Header inverted as='a' href="/">
                        <Image src="/icon.png"/>
                        Triptracks
                    </Header>
                </Menu.Item>
                <Menu.Item as='a' active={window.location.pathname==="/trails/"} href="/trails/">Trails</Menu.Item>
                <Menu.Item as='a' active={window.location.pathname==="/packing/"} href="/packing/">Packing</Menu.Item>
                <Menu.Item position="right"><TrailsSearch/></Menu.Item>
                <AccountMenu/>
            </Container>
        </Menu>
    </Segment>
}

function getAccessKey(){
    return localStorage.getItem("access_key")
}

export {getAccessKey, url, TopNav}