import {handleApiErrors, url} from "../../utils/auth";

function stringToGrams(s) {
    let value = s.split(" ")[0];
    if (value.includes("kg")) {
        return parseFloat(value.replace("kg", "")) * 1000
    } else if (value.includes("g")) {
        return parseFloat(value.replace("g", ""))
    } else {
        console.log(`Unknown weight unit ${s}`)
    }
}

export function stringToWeightString(grams) {
    if (typeof grams === "string") {
        grams = stringToGrams(grams)
    }
    if (grams >= 1000) {
        return `${grams / 1000}kg`
    }
    return `${grams}g`
}

export function productToWeightStrings(product) {
    let weightString = "";
    if (product.weights.length > 0) {
        weightString = product.weights[product.weightIndex].value;
    } else {
        weightString = product.customWeight + "g";
    }
    const totalWeight = stringToWeightString(stringToGrams(weightString) * product.quantity);
    return {weightString, totalWeight}
}

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

export function packWeights(products) {
    function validNumber(n) {
        if (!isNaN(parseFloat(n)) && isFinite(n)) {
            return n
        }
        return 0
    }

    let packWeight = 0;
    let outOfPackWeight = 0;
    if (products !== undefined) {
        products.forEach(product => {
            if (product.inPack) {
                if (product.weights.length === 0) {
                    packWeight += validNumber(product.quantity * product.customWeight)
                    return
                }
                packWeight += validNumber(product.quantity * stringToGrams(product.weights[product.weightIndex].value))
            } else {
                if (product.weights.length === 0) {
                    outOfPackWeight += validNumber(product.quantity * product.customWeight)
                    return
                }
                outOfPackWeight += validNumber(product.quantity * stringToGrams(product.weights[product.weightIndex].value))
            }
        })
    }
    return {packWeight, outOfPackWeight, totalWeight: packWeight + outOfPackWeight}
}

