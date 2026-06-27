import axios from "axios";
import OpenAPIClientAxios from "openapi-client-axios";
import {toast} from "react-toastify";
import {Header} from "semantic-ui-react";

const apiBase = process.env.REACT_APP_API_URL ?? 'https://triptracks2.oram.ca';

function apiUrl(path) {
    return `${apiBase}${path}`;
}

const api = new OpenAPIClientAxios({
    definition: `${apiBase}/openapi.json`,
    withServer: {
        url: apiBase || '/'
    },
    // CRA/webpack mishandles axios inside openapi-client-axios; pass our own instance.
    axiosInstance: axios.create({
        headers: {
            'Access-Key': 'your2',
        },
    }),
});
api.init()
    .then(client => {
        console.log('Client is ready');
    })
    .catch(err => {
        console.error('Error initializing OpenAPI client', err);
    });

function toastErrors(response){
    if(response.errors !== undefined){
        response.errors.forEach(error => {
            const path = error.loc.join(".")
            const errorMsg = <>
                <Header as="h4">{error.msg}</Header>
                {path}
            </>
            toast.error(errorMsg)
        });
    }
}

async function login(credential) {
    const response = await fetch(apiUrl('/api/v0/access_key'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credential }),
    });
    if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `login failed (${response.status})`);
    }
    const data = await response.json();

    let profile = {};
    if (credential.includes('.') && credential.split('.').length >= 3) {
        try {
            profile = JSON.parse(atob(credential.split('.')[1]));
        } catch (_) {
            profile = {};
        }
    }
    profile = {
        ...profile,
        email: data.email ?? profile.email,
        name: data.name ?? profile.name ?? profile.email,
        sub: data.provider_subject ?? profile.sub,
        id: data.user_id,
    };

    return {
        token: data.token,
        user_id: data.user_id,
        profile,
    };
}

async function getPlans(accessToken){
    return api.getClient().then(client => {
        return client.get_trip_plans_api_v0_trip_plans_get({}, {},{
            headers: {
            'Access-Key': accessToken,
        }})
    }).then(response => {
        toastErrors(response)
        return response
    });
}

async function getPlan(accessToken, plan_id){
    return api.getClient().then(client => {
        return client.get_trip_plan_api_v0_trip_plan__trip_plan_id__get(
            {
                trip_plan_id: plan_id
            }, {},
            {
                headers: {
                    'Access-Key': accessToken,
                }
            }
        )
    }).then(response => {
        toastErrors(response)
        return response
    });

}

async function updatePlan(accessToken, plan, plan_id){
    if (plan.dates !== null && plan.dates.dates === null){
        plan.dates = null
    }
    if (plan.dates !== null && plan.dates.type === "range" && plan.dates.dates.includes(null)){
        plan.dates = {
            type: "range",
            dates: [],
        }
    }
    return api.getClient({
        axiosConfigDefaults: {
        headers: {
            'Access-Key': accessToken,
        },
        },
    }).then(client => {
        return client.update_trip_plan_api_v0_trip_plan__trip_plan_id__patch(
            {
                trip_plan_id: plan_id
            },
            plan,
            {
                headers: {
                    'Access-Key': accessToken,
                }
            }
        )
    }).then(response => {
        toastErrors(response)
        return response
    }).catch(err => {
        if (err && err.response && err.response.data) {
            toastErrors(err.response.data)
        } else {
            console.error("updatePlan failed", err)
        }
    })
}

async function getForecast(latitude, longitude){
    return api.getClient().then(client => {
        return client.forecast_api_v0_forecast_get(
            {},
            {
                lat: latitude,
                lng: longitude
            }
        )
    }).then(response => {
        toastErrors(response)
        return response
    });
}


async function getPartners(accessToken){
    return api.getClient().then(client => {
        return client.partners_api_v0_partners_get({}, {},{
            headers: {
                'Access-Key': accessToken,
            }})
    }).then(response => {
        toastErrors(response)
        return response
    });
}

async function addPartner(accessToken, email){
    return api.getClient().then(client => {
        return client.add_partner_api_v0_partner_post({}, {email}, {
            headers: {
                'Access-Key': accessToken,
            }
        })
    }).then(response => {
        toastErrors(response)
        return response
    });

}

async function removePartner(accessToken, partner_id){
    return api.getClient().then(client => {
        return client.remove_partner_api_v0_partner__partner_id__delete(
            {
                partner_id
            },
            {},
            {
                headers: {
                    'Access-Key': accessToken,
                }
            }
        )
    }).then(response => {
        toastErrors(response)
        return response
    });
}

export {
    login,
    getPlans,
    getPlan,
    updatePlan,
    getForecast,
    getPartners,
    addPartner,
    removePartner,
}