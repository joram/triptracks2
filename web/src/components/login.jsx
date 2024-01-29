import {Button, Container, Dropdown, Header, Segment} from "semantic-ui-react";
import {useHistory} from "react-router-dom/cjs/react-router-dom";
import {useContext} from "react";
import GoogleLogin from "react-google-login";
import {UserContext} from "../App";

function AccountMenu(){
    let history = useHistory()
    const { user, setUser, setAccessToken } = useContext(UserContext);

    function loginSuccess(response) {
        console.log("login success", response)
        setUser(response.profileObj)
        setAccessToken(response.tokenId)
    }

    function logout(){
        setUser(undefined)
        setAccessToken(undefined)
        history.push("/")
    }

    if (user !== undefined && user !== null && user.google_userinfo !== undefined){
        const googleUserInfo = user.google_userinfo
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

function Login() {
    const { user } = useContext(UserContext);
    if (user !== undefined && user !== null){
        return (
            <Container>
                <br/>
                <Header as='h1'>Login</Header>
                <Segment basic>
                    <p>
                        You are already logged in.
                    </p>
                </Segment>
            </Container>
        );
    }
    return <Container>
      <br/>
      <Header as='h1'>Login</Header>
        <Segment basic>
            <p>
                right now the only way to login is with google.  I'm working on adding other options.
            </p>
        </Segment>
        <Segment basic>
            <p>
                If you have a google account, you can login with it here:
            </p>
        </Segment>
      <AccountMenu />
  </Container>
}

export default Login;