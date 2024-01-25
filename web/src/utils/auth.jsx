import Cookies from "universal-cookie";

const cookies = new Cookies();

function getUserInfo(){
    return cookies.get("userinfo")
}

function setUserInfo(userinfo){
    if (userinfo === undefined){
        cookies.remove("userinfo")
        return
    }
    cookies.set("userinfo", userinfo)
}

function getAccessKey(){
    return cookies.get("accessKey")
}

function setAccessKey(accessKey){
    if (accessKey === undefined){
        cookies.remove("accessKey")
        return
    }
    cookies.set("accessKey", accessKey)
}
function isLoggedIn(){
    let accessKey = getAccessKey()
    let userinfo = getUserInfo()
    console.log("is logged in?", accessKey, userinfo)
    return (accessKey !== undefined && userinfo !== undefined)
}

export {isLoggedIn, getUserInfo, getAccessKey, setUserInfo, setAccessKey}