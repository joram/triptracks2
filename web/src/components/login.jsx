import {Button} from "semantic-ui-react";
import {useContext} from "react";
import {GoogleLogin} from "@react-oauth/google";
import {UserContext} from "../App";
import {login} from "../utils/api";
import {externalOAuthStartUrl} from "../utils/oauthStart";

export function LoginButton(){
    const { setUser, setAccessToken } = useContext(UserContext);
    const oauthStartUrl = externalOAuthStartUrl("google");

    async function loginSuccess(credentialResponse) {
        const { token, profile } = await login(credentialResponse.credential);
        setUser(profile);
        setAccessToken(token);
    }

    if (oauthStartUrl) {
        return <Button primary onClick={() => { window.location.href = oauthStartUrl; }}>
            Sign in with Google
        </Button>
    }

    return <GoogleLogin
        onSuccess={loginSuccess}
        onError={() => console.log("Login Failed")}
    />
}
