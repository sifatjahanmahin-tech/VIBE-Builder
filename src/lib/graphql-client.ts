import { clients } from './https';

interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
}

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

interface GraphQLClient {
  query<T>(request: GraphQLRequest): Promise<T>;
  mutate<T>(request: GraphQLRequest): Promise<T>;
}

const projectKey = import.meta.env.VITE_X_BLOCKS_KEY || '';
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const projectSlug = import.meta.env.VITE_PROJECT_SLUG || '';
const GRAPHQL_URL = `${baseUrl}/uds/v1/${projectSlug}/gateway`;

async function gqlFetch<T>(request: GraphQLRequest): Promise<T> {
  const response = await clients.post<GraphQLResponse<T>>(
    GRAPHQL_URL,
    JSON.stringify({ query: request.query, variables: request.variables ?? {} }),
    {
      'Content-Type': 'application/json',
      'x-blocks-key': projectKey,
    }
  );

  if (response.errors?.length) {
    throw new Error(response.errors[0].message);
  }

  return (response.data as T) ?? ({} as T);
}

export const graphqlClient: GraphQLClient = {
  query: gqlFetch,
  mutate: gqlFetch,
};

export default graphqlClient;
