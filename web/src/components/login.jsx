import {Button, Container, Dropdown, Header, Segment} from "semantic-ui-react";
import {useHistory} from "react-router-dom/cjs/react-router-dom";
import {useContext} from "react";
import {GoogleLogin} from "@react-oauth/google";
import {UserContext} from "../App";
import {login} from "../utils/api";
import {externalOAuthStartUrl} from "../utils/oauthStart";

export function LoginButton(){
    let history = useHistory()
    const { user, setUser, setAccessToken } = useContext(UserContext);
    const oauthStartUrl = externalOAuthStartUrl("google");

    async function loginSuccess(credentialResponse) {
        const credential = credentialResponse.credential;
        login(credential).then(({ token, profile }) => {
            setUser(profile);
            setAccessToken(token);
        });
    }

    function logout(){
        setUser(undefined)
        setAccessToken(undefined)
        history.push("/")
    }

    if (user !== undefined && user !== null && (user.google_userinfo !== undefined || user.email !== undefined)){
        const googleUserInfo = user.google_userinfo ?? user
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

    if (oauthStartUrl) {
        return <div style={{
            marginTop: "15px",
            marginBottom: "15px",
        }}>
            <Button primary onClick={() => { window.location.href = oauthStartUrl; }}>
                Sign in with Google
            </Button>
        </div>
    }

    return <div style={{
        marginTop: "15px",
        marginBottom: "15px",
    }}>
        <GoogleLogin
            onSuccess={loginSuccess}
            onError={() => console.log("Login Failed")}
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