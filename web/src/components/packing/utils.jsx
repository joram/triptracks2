import {handleApiErrors, url} from "../../utils/auth";

export async function getPackingList(id) {
    return fetch(url("/api/v0/packing_list/" + id), {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(response => {
        return response.json()
    }).then(response => {
        handleApiErrors(response)
        return response
    })
}
