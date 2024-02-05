import {toast} from "react-toastify";
import {Header} from "semantic-ui-react";

const OpenAPIClientAxios = require('openapi-client-axios').default;

const api = new OpenAPIClientAxios({
    definition: 'https://triptracks2.oram.ca/openapi.json',
    withServer: {
        url: 'https://triptracks2.oram.ca'
    }
});
api.init({
    axiosConfigDefaults: {
        headers: {
            'Access-Key': 'your2',
        }
    },
})
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

async function login(token, profile){
    return api.getClient().then(client => {
        return client.create_access_key_api_v0_access_key_post({}, {token, profile}).then(response => {
            toastErrors(response)
            return response
        })
    });
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
    console.log("updating plan", plan, plan_id, accessToken)
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
        toastErrors(err.response.data)
    })
}

export {login, getPlans, getPlan, updatePlan}