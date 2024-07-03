import { retrieveHasuraData } from '../api/api.js';

class GraphQL {
    constructor(query, variables, appId) {
        this.query = query;
        const matches = query.match(/^(query|mutation)\s+(\w+)/);
        this.operationName = matches ? matches[2] : null;
        this.variables = variables;
        this.payload = {
            operationName: this.operationName,
            query: this.query,
            variables: this.variables
        };
        this.appId = appId;
    }

    async execute() {
        console.log(JSON.stringify(this.payload));
        try {
            const getData = await retrieveHasuraData(this.appId);
            const response = await getData(this.payload);
            if (response.errors) {
                throw new Error(JSON.stringify(response.errors));
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }
}

export default GraphQL;
