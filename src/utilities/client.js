import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
    uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
    cache: new InMemoryCache(),
    headers: {
        'x-hasura-admin-secret': process.env.REACT_APP_PROD_SECRET,
    },
});

export default client;
