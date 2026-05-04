import { useAuthStore } from '@/state/store/auth';
import { isLocalhost } from './utils/localhost-checker/locahost-checker';

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

// Selise Blocks GraphQL endpoint (confirmed from llm-docs/recipes/graphql-crud.md)
const GRAPHQL_BASE_URL = `${baseUrl}/graphql/v1/graphql`;

async function gqlFetch<T>(request: GraphQLRequest): Promise<T> {
  // Mirror the behaviour of clients.post() in src/lib/https.ts:
  // - On localhost: send Bearer token from auth store, no credentials flag
  // - On deployed (non-localhost): send auth cookie via credentials:'include', no token header
  const onLocalhost = isLocalhost();
  const token = onLocalhost ? useAuthStore.getState().accessToken : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-blocks-key': projectKey,
  };
  if (token) {
    headers['Authorization'] = `bearer ${token}`;
  }

  // eslint-disable-next-line no-console
  console.debug('[GraphQL]', GRAPHQL_BASE_URL, request.query.trim().slice(0, 80));

  const res = await fetch(GRAPHQL_BASE_URL, {
    method: 'POST',
    headers,
    credentials: onLocalhost ? 'same-origin' : 'include',
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
