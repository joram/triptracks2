import {Button, Container, Dropdown, Header, Image, Menu, Segment} from "semantic-ui-react";
import TrailsSearch from "./trails/TrailsSearch";
import GoogleLogin from 'react-google-login';
import {Component} from "react";
import Cookies from 'universal-cookie';
import {AccessKeyContext, UserinfoContext} from "../utils/context";
import {withRouter} from "react-router-dom";

const cookies = new Cookies();

let accessKey = cookies.get("accessKey")
if(accessKey !== undefined){
    AccessKeyContext.accessKey = accessKey
}

let userinfo = cookies.get("userinfo")
if(userinfo !== undefined){
    UserinfoContext.userinfo = userinfo
}

function url(path){
    let base = "https://triptracks2.oram.ca"
    if (process.env.REACT_APP_ENVIRONMENT==="local")
        base = "http://localhost:8000"
    return base+path
}

function updateAccessKey(token){
    let accessKeyContext = AccessKeyContext
    return fetch(url("/api/v0/access_key"), {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({token: token})
    }).then(response => {
        return response.json()
    }).then(newAccessKey => {
        handleApiErrors(newAccessKey)
        cookies.set("accessKey", newAccessKey)
        accessKeyContext.accessKey = newAccessKey
        return newAccessKey
    });
}

function handleApiErrors(response){
    let accessKeyContext = AccessKeyContext
    let userinfoContext = UserinfoContext
    if(response["detail"] !== undefined){
        console.log("api error, logging out:", response["detail"])
        accessKeyContext.accessKey = undefined
        userinfoContext.userinfo = undefined
        return true
    }
    return false
}

function updateUserInfo(){
    let accessKey = AccessKeyContext.accessKey
    let userinfoContext = UserinfoContext
    return fetch(url("/api/v0/userinfo"), {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Access-Key': accessKey,
        },
    }).then(response => {
        return response.json()
    }).then(newuserinfo => {
        if(!handleApiErrors(newuserinfo)){
            userinfoContext.userinfo = newuserinfo
            cookies.set("userinfo", newuserinfo)
            return newuserinfo
        }
    });
}


class AccountMenu extends Component {

    isLoggedIn(){
        let accessKey = AccessKeyContext.accessKey
        let userinfo = UserinfoContext.userinfo
        return (accessKey !== undefined && userinfo !== undefined)
    }

    loginSuccess(response) {
        updateAccessKey(response.tokenId).then(_ => {
            updateUserInfo().then(_ => {
                this.setState({isLoggedIn: true})
            })
        })
    }

    logoutSuccess(resp){
        UserinfoContext.userinfo = undefined
        AccessKeyContext.accessKey = undefined
        cookies.remove("userinfo", { path: '/' })
        cookies.remove("accessKey", { path: '/' })
        this.props.history.push("/")
        this.setState({isLoggedIn: false})
    }

    render() {
        let userinfo = UserinfoContext.userinfo
        let accessKey = AccessKeyContext.accessKey
        console.log("context accessKey", accessKey)
        console.log("context userinfo", userinfo)

        if (this.isLoggedIn() === false) {
            console.log("showing login button")
            return <div style={{
                marginTop: "15px",
                marginBottom: "15px",
            }}>
                <GoogleLogin
                    clientId="965794564715-ebal2dv5tdac3iloedmnnb9ph0lptibp.apps.googleusercontent.com"
                    buttonText="Login"
                    onSuccess={this.loginSuccess.bind(this)}
                    cookiePolicy={'single_host_origin'}
                />
            </div>
        }

        if (userinfo !== undefined) {
            let menuTitle = <Dropdown.Header style={{marginTop: "30px"}}>
                <Image avatar src={userinfo.picture}/>
                {userinfo.name}
            </Dropdown.Header>;
            return <Dropdown text={menuTitle}>
                <Dropdown.Menu>
                    {/*<Dropdown.Item><Link to="/routes" style={link_style}>My Routes</Link></Dropdown.Item>*/}
                    {/*<Dropdown.Item><Link to="/plans" style={link_style}>My Plans</Link></Dropdown.Item>*/}
                    {/*<Dropdown.Item><Link to="/settings" style={link_style}>Settings</Link></Dropdown.Item>*/}
                    <Dropdown.Item>
                        <Button
                            onClick={this.logoutSuccess.bind(this)}
                            // render={renderProps => (<div onClick={renderProps.onClick}>Logout</div>)}
                        >logout</Button>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        }


        return <></>
    }
}

let AccountMenuWithRouter = withRouter(AccountMenu)

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
                <Menu.Item as='a' active={window.location.pathname==="/"} href="/">Trails</Menu.Item>
                <Menu.Item as='a' active={window.location.pathname.startsWith("/packing")} href="/packing/list">Packing</Menu.Item>
                <Menu.Item as='a' active={window.location.pathname.startsWith("/plan")} href="/plan/list">Trip Plans</Menu.Item>
                <Menu.Item position="right"><TrailsSearch/></Menu.Item>
                <AccountMenuWithRouter/>
            </Container>
        </Menu>
    </Segment>
}


export {url, TopNav, handleApiErrors}
