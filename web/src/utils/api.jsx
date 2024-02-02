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


async function login(token){
    return api.getClient().then(client => {
        return client.create_access_key_api_v0_access_key_post({}, {token})
    });
}

async function getPlans(accessToken){
    return api.getClient({
        axiosConfigDefaults: {
        headers: {
            'Access-Key': accessToken,
        },
        },
    }).then(client => {
        return client.get_trip_plans_api_v0_trip_plans_get({}, {},{
            headers: {
            'Access-Key': accessToken,
        }})
    });
}

async function updatePlan(accessToken, plan, plan_id){
    if (plan.dates !== null && plan.dates.dates === null){
        plan.dates = null
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
    });
}

export {login, getPlans, updatePlan}