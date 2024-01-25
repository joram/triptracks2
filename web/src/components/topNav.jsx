import {Button, Container, Dropdown, Header, Image, Menu, Segment} from "semantic-ui-react";
import TrailsSearch from "./trails/TrailsSearch";
import GoogleLogin from 'react-google-login';
import {withRouter} from "react-router-dom";
import {useHistory} from "react-router-dom/cjs/react-router-dom";
import {useState} from "react";
import {getAccessKey, getUserInfo, setAccessKey, setUserInfo} from "../utils/auth";


function url(path){
    let base = "https://triptracks2.oram.ca"
    if (process.env.REACT_APP_ENVIRONMENT==="local")
        base = "http://localhost:8000"
    return base+path
}

function updateAccessKey(token){
    return fetch(url("/api/v0/access_key"), {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({token: token})
    }).then(response => {
        return response.json()
    }).then(newAccessKey => {
        handleApiErrors(newAccessKey)
        setAccessKey( newAccessKey)
        return newAccessKey
    });
}

function handleApiErrors(response){
    if(response["detail"] !== undefined){
        console.log("api error, logging out:", response["detail"])
        setUserInfo(undefined)
        setAccessKey(undefined)
        return true
    }
    return false
}

function updateUserInfo(){
    return fetch(url("/api/v0/userinfo"), {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Access-Key': getAccessKey(),
        },
    }).then(response => {
        return response.json()
    }).then(newuserinfo => {
        if(!handleApiErrors(newuserinfo)){
            setUserInfo(newuserinfo)
            return newuserinfo
        }
    });
}


function AccountMenu({onLoginChange}){
    let history = useHistory()
    let [isLoggedIn, setIsLoggedIn] = useState(getAccessKey() === undefined)

    function loginSuccess(response) {
        updateAccessKey(response.tokenId).then(_ => {
            updateUserInfo().then(_ => {
                setIsLoggedIn(true)
                onLoginChange(true)
            })
        })
    }

    function logout(){
        setUserInfo(undefined)
        setAccessKey(undefined)
        setIsLoggedIn(false)
        onLoginChange(false)
        history.push("/")
    }

    const userInfo = getUserInfo()
    if (userInfo !== undefined && userInfo.google_userinfo !== undefined){
        const googleUserInfo = userInfo.google_userinfo
        return <Dropdown
            item
            labeled
            icon='user'
            floating
            text={googleUserInfo.name}
        >
            <Dropdown.Menu>
                <Dropdown.Item>
                        <Button onClick={logout}>logout</Button>
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    }

    return <div style={{
        marginTop: "15px",
        marginBottom: "15px",
    }}>
        <GoogleLogin
            clientId="965794564715-ebal2dv5tdac3iloedmnnb9ph0lptibp.apps.googleusercontent.com"
            buttonText="Login"
            onSuccess={loginSuccess}
            cookiePolicy={'single_host_origin'}
        />
    </div>
}

let AccountMenuWithRouter = withRouter(AccountMenu)

const TopNav = ({ fixed, onLoginChange}) => {
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
                <AccountMenuWithRouter onLoginChange={onLoginChange}/>
            </Container>
        </Menu>
    </Segment>
}


export {url, TopNav, handleApiErrors}
