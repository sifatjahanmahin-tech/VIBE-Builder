import { useAuthStore } from '@/state/store/auth';

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

// Selise Blocks Data Gateway GraphQL endpoint — slug goes in x-blocks-key header, not the URL
const GRAPHQL_BASE_URL = `${baseUrl}/uds/v1/graphql`;

async function gqlFetch<T>(request: GraphQLRequest): Promise<T> {
  const token = useAuthStore.getState().accessToken;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-blocks-key': projectKey,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // eslint-disable-next-line no-console
  console.debug('[GraphQL]', GRAPHQL_BASE_URL, request.query.trim().slice(0, 80));

  const res = await fetch(GRAPHQL_BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: request.query, variables: request.variables ?? {} }),
  });

  if (!res.ok) {
    const text = await res.text();
    // eslint-disable-next-line no-console
    console.error('[GraphQL] HTTP error', res.status, text);
    throw new Error(`GraphQL HTTP ${res.status}: ${text}`);
  }

  const json: GraphQLResponse<T> = await res.json();

  if (json.errors?.length) {
    // eslint-disable-next-line no-console
    console.error('[GraphQL] errors', json.errors);
    throw new Error(json.errors[0].message);
  }

  return (json.data as T) ?? ({} as T);
}

export const graphqlClient: GraphQLClient = {
  query: gqlFetch,
  mutate: gqlFetch,
};

export default graphqlClient;
