function url(path){
    if (process.env.REACT_APP_ENVIRONMENT === "local")
        return "http://localhost:8000" + path
    const base = process.env.REACT_APP_API_URL ?? "https://triptracks2.oram.ca"
    return base + path
}

function handleApiErrors(response){
    if(response["detail"] !== undefined){
        console.log("api error:", response["detail"])
        return true
    }
    return false
}



export {url, handleApiErrors}