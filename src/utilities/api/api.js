const app_key = {
    "xuemi": {
        "clientId": "xuemi_1538003",
        "key": "uAHRBsrHvNSxkHhQhbnm4VRbWdhh7sE9",
    },
    "sixdigital": {
        "clientId": "sixdigital_1930321",
        "key": "75fd713bf735de026aa449b0256d3d54",
    }
};

async function retrieveHasuraData(appId) {
    const payload = { ...app_key[appId], permission: [] };
    console.log('Payload for auth request:', JSON.stringify(payload));
    let authToken = null;

    try {
        const response = await fetch('https://api.kolable.app/api/v1/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        console.log('Auth response status:', response.status);
        const data = await response.json();
        console.log('Auth response data:', data);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (data && data.result && data.result.authToken) {
            authToken = data.result.authToken;
        } else {
            throw new Error('Failed to retrieve authToken');
        }
    } catch (error) {
        console.error('Error fetching authToken:', error);
        throw error;
    }

    return async (queryPayload) => {
        const response = await fetch('https://rhdb.kolable.com/v1/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(queryPayload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    };
}

export { retrieveHasuraData };
