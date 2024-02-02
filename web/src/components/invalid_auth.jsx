import {LoginButton} from "./login";

function InvalidAuth({children}){
    return (
        <div>
            <h1>Invalid Auth</h1>
            {children}
            <LoginButton />

        </div>
    )
}

export default InvalidAuth;