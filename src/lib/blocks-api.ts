/**
 * VibeBuilder — Blocks GraphQL API
 *
 * Endpoint : https://api.seliseblocks.com/graphql/v1/graphql
 * Pattern  : DynamicQueryInput — filter is a JSON-stringified MongoDB filter
 * Schemas  : WebsiteProject, PageLayout (created via Data Gateway)
 *
 * Query field names : schema name + 's'  (WebsiteProject → WebsiteProjects)
 * Mutations         : insert/update/deleteWebsiteProject, insert/update/deletePageLayout
 * Insert response   : { itemId, totalImpactedData, acknowledged }
 * Update/Delete     : { totalImpactedData, acknowledged }
 * Filter            : JSON.stringify({ field: value })  — passed as String variable
 */

import { v4 as uuidv4 } from 'uuid';
import { graphqlClient } from './graphql-client';
import { PageLayout, VibeComponent, WebsiteProject } from '@/types/vibebuilder';

const projectKey = import.meta.env.VITE_X_BLOCKS_KEY || '';
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const GRAPHQL_URL = `${baseUrl}/graphql/v1/graphql`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseComponents(raw: string | null | undefined): VibeComponent[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as VibeComponent[]; }
  catch { return []; }
}

// ---------------------------------------------------------------------------
// Public (unauthenticated) GraphQL fetch — used by the live renderer
// No Authorization header; x-blocks-key still required.
// ---------------------------------------------------------------------------

async function publicQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-blocks-key': projectKey,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    // eslint-disable-next-line no-console
    console.error('[VibeBuilder public] HTTP', res.status, text);
    throw new Error(`GraphQL HTTP ${res.status}: ${text}`);
  }
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

// ---------------------------------------------------------------------------
// Website Projects
// ---------------------------------------------------------------------------

export async function getMyWebsites(userId: string): Promise<WebsiteProject[]> {
  const query = `
    query GetMyWebsites($input: DynamicQueryInput) {
      WebsiteProjects(input: $input) {
        totalCount
        items {
          ItemId
          userId
          siteName
        }
      }
    }
  `;
  const data = await graphqlClient.query<{ WebsiteProjects: { items: any[] } }>({
    query,
    variables: {
      input: {
        filter: JSON.stringify({ userId }),
        sort: '{}',
        pageNo: 1,
        pageSize: 100,
      },
    },
  });
  return (data.WebsiteProjects?.items ?? []).map((r) => ({
    _id: r.ItemId,
    siteId: r.ItemId,
    userId: r.userId ?? userId,
    siteName: r.siteName ?? '',
  }));
}

export async function createWebsite(siteName: string, userId: string): Promise<WebsiteProject> {
  const mutation = `
    mutation CreateWebsite($input: WebsiteProjectInsertInput!) {
      insertWebsiteProject(input: $input) {
        itemId
        totalImpactedData
        acknowledged
      }
    }
  `;
  try {
    const data = await graphqlClient.mutate<{
      insertWebsiteProject: { itemId: string; totalImpactedData: number; acknowledged: boolean };
    }>({
      query: mutation,
      variables: { input: { userId, siteName } },
    });
    // eslint-disable-next-line no-console
    console.debug('[VibeBuilder] createWebsite response:', data);
    const itemId = data.insertWebsiteProject.itemId;
    return { _id: itemId, siteId: itemId, userId, siteName };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[VibeBuilder] createWebsite failed:', err);
    throw err;
  }
}

export async function deleteWebsite(siteId: string): Promise<void> {
  const mutation = `
    mutation DeleteWebsite($filter: String!, $input: WebsiteProjectDeleteInput!) {
      deleteWebsiteProject(filter: $filter, input: $input) {
        acknowledged
        totalImpactedData
      }
    }
  `;
  await graphqlClient.mutate({
    query: mutation,
    variables: {
      filter: JSON.stringify({ _id: siteId }),
      input: { isHardDelete: true },
    },
  });
}

// ---------------------------------------------------------------------------
// Page Layouts
// ---------------------------------------------------------------------------

export async function getSitePages(siteId: string): Promise<PageLayout[]> {
  const query = `
    query GetSitePages($input: DynamicQueryInput) {
      PageLayouts(input: $input) {
        totalCount
        items {
          ItemId
          pageId
          siteId
          userId
          slug
          isPublished
          components
        }
      }
    }
  `;
  const data = await graphqlClient.query<{ PageLayouts: { items: any[] } }>({
    query,
    variables: {
      input: {
        filter: JSON.stringify({ siteId }),
        sort: '{}',
        pageNo: 1,
        pageSize: 100,
      },
    },
  });
  return (data.PageLayouts?.items ?? []).map(toPageLayout);
}

export async function createPage(
  siteId: string,
  userId: string,
  pageName: string,
  slug: string
): Promise<PageLayout> {
  const pageId = uuidv4();
  const mutation = `
    mutation CreatePage($input: PageLayoutInsertInput!) {
      insertPageLayout(input: $input) {
        itemId
        totalImpactedData
        acknowledged
      }
    }
  `;
  const pageSlug = slug || pageName.toLowerCase().replace(/\s+/g, '-');
  await graphqlClient.mutate<{
    insertPageLayout: { itemId: string; totalImpactedData: number; acknowledged: boolean };
  }>({
    query: mutation,
    variables: {
      input: {
        pageId,
        siteId,
        userId,
        slug: pageSlug,
        isPublished: false,
        components: JSON.stringify([]),
      },
    },
  });
  return {
    _id: pageId,
    pageId,
    siteId,
    userId,
    pageName: pageSlug,
    slug: pageSlug,
    isPublished: false,
    components: [],
  };
}

export async function getPageLayout(pageId: string): Promise<PageLayout | null> {
  const query = `
    query GetPageLayout($input: DynamicQueryInput) {
      PageLayouts(input: $input) {
        items {
          ItemId
          pageId
          siteId
          userId
          slug
          isPublished
          components
        }
      }
    }
  `;
  const data = await graphqlClient.query<{ PageLayouts: { items: any[] } }>({
    query,
    variables: {
      input: {
        filter: JSON.stringify({ pageId }),
        sort: '{}',
        pageNo: 1,
        pageSize: 1,
      },
    },
  });
  const item = data.PageLayouts?.items?.[0];
  return item ? toPageLayout(item) : null;
}

export async function savePageLayout(pageId: string, components: VibeComponent[]): Promise<void> {
  const mutation = `
    mutation SavePageLayout($filter: String!, $input: PageLayoutUpdateInput!) {
      updatePageLayout(filter: $filter, input: $input) {
        totalImpactedData
        acknowledged
      }
    }
  `;
  await graphqlClient.mutate({
    query: mutation,
    variables: {
      filter: JSON.stringify({ pageId }),
      input: { components: JSON.stringify(components) },
    },
  });
}

export async function publishPage(pageId: string, isPublished: boolean): Promise<void> {
  const mutation = `
    mutation PublishPage($filter: String!, $input: PageLayoutUpdateInput!) {
      updatePageLayout(filter: $filter, input: $input) {
        totalImpactedData
        acknowledged
      }
    }
  `;
  await graphqlClient.mutate({
    query: mutation,
    variables: {
      filter: JSON.stringify({ pageId }),
      input: { isPublished },
    },
  });
}

export async function deletePage(pageId: string): Promise<void> {
  const mutation = `
    mutation DeletePage($filter: String!, $input: PageLayoutDeleteInput!) {
      deletePageLayout(filter: $filter, input: $input) {
        acknowledged
        totalImpactedData
      }
    }
  `;
  await graphqlClient.mutate({
    query: mutation,
    variables: {
      filter: JSON.stringify({ pageId }),
      input: { isHardDelete: true },
    },
  });
}

// ---------------------------------------------------------------------------
// Shared response mapper
// ---------------------------------------------------------------------------

function toPageLayout(r: any): PageLayout {
  return {
    _id: r.ItemId ?? r.pageId,
    pageId: r.pageId,
    siteId: r.siteId,
    userId: r.userId,
    pageName: r.slug ?? r.pageId,
    slug: r.slug,
    isPublished: r.isPublished ?? false,
    components: parseComponents(r.components),
  };
}

// ---------------------------------------------------------------------------
// Public queries — no auth, used by the live renderer
// ---------------------------------------------------------------------------

export async function getPublicPageLayout(
  userId: string,
  slug: string
): Promise<PageLayout | null> {
  const query = `
    query GetPublicPage($input: DynamicQueryInput) {
      PageLayouts(input: $input) {
        items {
          ItemId
          pageId
          siteId
          userId
          slug
          isPublished
          components
        }
      }
    }
  `;
  const data = await publicQuery<{ PageLayouts: { items: any[] } }>(query, {
    input: {
      filter: JSON.stringify({ userId, slug, isPublished: true }),
      sort: '{}',
      pageNo: 1,
      pageSize: 1,
    },
  });
  const item = data.PageLayouts?.items?.[0];
  return item ? toPageLayout(item) : null;
}

export async function getPublicSitePages(userId: string, siteId: string): Promise<PageLayout[]> {
  const query = `
    query GetPublicSitePages($input: DynamicQueryInput) {
      PageLayouts(input: $input) {
        items {
          ItemId
          pageId
          siteId
          userId
          slug
          isPublished
        }
      }
    }
  `;
  const data = await publicQuery<{ PageLayouts: { items: any[] } }>(query, {
    input: {
      filter: JSON.stringify({ userId, siteId, isPublished: true }),
      sort: '{}',
      pageNo: 1,
      pageSize: 100,
    },
  });
  return (data.PageLayouts?.items ?? []).map(toPageLayout);
}
