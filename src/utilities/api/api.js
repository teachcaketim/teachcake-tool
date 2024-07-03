const app_key = {
    "xuemi": {
        "clientId": "xuemi_1538003",
        "key": "uAHRBsrHvNSxkHhQhbnm4VRbWdhh7sE9",
    },
    "sixdigital": {
        "clientId": "sixdigital_1930321",
        "key": "75fd713bf735de026aa449b0256d3d54",
    }
}

async function retrieveHasuraData(appId) {
    const payload = { payload: { ...app_key[appId], permission: [] } };
    const response = await fetch('https://api.kolable.app/api/v1/auth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    const authToken = data.result.authToken;

    return async (queryPayload) => {
        const response = await fetch('https://rhdb.kolable.com/v1/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(queryPayload),
        });
        const result = await response.json();
        return result;
    };
}

export { retrieveHasuraData };
