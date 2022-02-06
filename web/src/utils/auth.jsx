import {AccessKeyContext, UserinfoContext} from "./context";

function isLoggedIn(){
    let accessKey = AccessKeyContext.accessKey
    let userinfo = UserinfoContext.userinfo
    console.log("is logged in?", accessKey, userinfo)
    return (accessKey !== undefined && userinfo !== undefined)
}

export {isLoggedIn}