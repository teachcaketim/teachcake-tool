const secret = process.env.REACT_APP_PROD_SECRET;
const graphQLEntry = process.env.REACT_APP_GRAPHQL_ENDPOINT;

class GraphQL {
    constructor(query, variables) {
        this.query = query;
        const matches = query.match(/^(query|mutation)\s+(\w+)/);
        this.operationName = matches ? matches[2] : null;
        this.variables = variables;
        this.payload = JSON.stringify({
            operationName: this.operationName,
            query: this.query,
            variables: this.variables
        });
        this.parameters = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-hasura-admin-secret": secret
            },
            body: this.payload,
        };
    }
    async execute() {
        console.log(this.payload);
        try {
            const response = await fetch(graphQLEntry, this.parameters);
            const parsedResponse = await response.json();
            if (parsedResponse.errors) {
                throw new Error(JSON.stringify(parsedResponse.errors));
            }
            return parsedResponse.data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }
}

export default GraphQL;
