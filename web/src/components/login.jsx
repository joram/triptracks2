import {Button, Container, Dropdown, Header, Segment} from "semantic-ui-react";
import {useHistory} from "react-router-dom/cjs/react-router-dom";
import {useContext} from "react";
import GoogleLogin from "react-google-login";
import {UserContext} from "../App";
import {url, handleApiErrors} from "../utils/auth";

export function LoginButton(){
    let history = useHistory()
    const { user, setUser, setAccessToken } = useContext(UserContext);

    function loginSuccess(response) {
        fetch(url("/api/v0/access_key"), {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({token: response.tokenId})
        }
        ).then(response2 => response2.json()
        ).then(data => {
            const {token, user_id} = data
            response.profileObj.id = user_id
            setUser(response.profileObj)
            setAccessToken(token)
        });
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

                    <LoginButton />
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
      <LoginButton />
  </Container>
}

export default Login;