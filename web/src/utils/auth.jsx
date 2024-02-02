function url(path){
    let base = "https://triptracks2.oram.ca"
    if (process.env.REACT_APP_ENVIRONMENT==="local")
        base = "http://localhost:8000"
    return base+path
}

function handleApiErrors(response){
    if(response["detail"] !== undefined){
        console.log("api error:", response["detail"])
        return true
    }
    return false
}



export {url, handleApiErrors}