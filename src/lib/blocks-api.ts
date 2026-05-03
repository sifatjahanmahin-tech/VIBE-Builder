/**
 * VibeBuilder — Blocks Data Gateway API
 *
 * Confirmed GraphQL operation names (from Data Gateway setup):
 *   WebsiteProject  → query: websiteProjects   insert: insertWebsiteProject
 *                      update: updateWebsiteProject  delete: deleteWebsiteProject
 *   PageLayout      → query: pageLayouts        insert: insertPageLayout
 *                      update: updatePageLayout       delete: deletePageLayout
 *
 * Schema fields actually deployed:
 *   WebsiteProject : userId, siteName, pages (String[])
 *                    — siteId not in schema; _id (MongoDB ObjectId) is used as siteId
 *   PageLayout     : pageId, userId, siteId, slug, isPublished, components (String/JSON)
 *                    — components must be JSON.stringified before saving
 */

import { v4 as uuidv4 } from 'uuid';
import { graphqlClient } from './graphql-client';
import { PageLayout, VibeComponent, WebsiteProject } from '@/types/vibebuilder';

const projectKey = import.meta.env.VITE_X_BLOCKS_KEY || '';
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const projectSlug = import.meta.env.VITE_PROJECT_SLUG ? `/${import.meta.env.VITE_PROJECT_SLUG}` : '';
const GRAPHQL_URL = `${baseUrl}/uds/v1${projectSlug}/gateway`;

// ---------------------------------------------------------------------------
// Raw GraphQL response shapes
// ---------------------------------------------------------------------------

interface UdsListResponse<T> {
  items: T[];
  total?: number;
}

interface WebsiteProjectRecord {
  _id: string;
  userId: string;
  siteName: string;
}

interface PageLayoutRecord {
  _id: string;
  pageId: string;
  siteId: string;
  userId: string;
  slug: string;
  isPublished: boolean;
  components: string; // always a JSON string from the gateway
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseComponents(raw: string | null | undefined): VibeComponent[] {
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as VibeComponent[];
    } catch {
      return [];
    }
  }
  return [];
}

function toPageLayout(r: PageLayoutRecord): PageLayout {
  return {
    _id: r._id,
    pageId: r.pageId,
    siteId: r.siteId,
    userId: r.userId,
    pageName: r.slug, // pageName not in schema; fall back to slug for display
    slug: r.slug,
    isPublished: r.isPublished ?? false,
    components: parseComponents(r.components),
  };
}

function toWebsiteProject(r: WebsiteProjectRecord): WebsiteProject {
  return {
    _id: r._id,
    siteId: r._id, // siteId not a schema field; use MongoDB _id as stable site key
    userId: r.userId,
    siteName: r.siteName,
  };
}

// ---------------------------------------------------------------------------
// Public (unauthenticated) GraphQL fetch — used by the live renderer
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
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

// ---------------------------------------------------------------------------
// Website Projects
// ---------------------------------------------------------------------------

export async function getMyWebsites(userId: string): Promise<WebsiteProject[]> {
  const query = `
    query GetMyWebsites($userId: String!) {
      websiteProjects(filter: { userId: { eq: $userId } }) {
        items {
          _id
          userId
          siteName
        }
      }
    }
  `;
  const data = await graphqlClient.query<{ websiteProjects: UdsListResponse<WebsiteProjectRecord> }>(
    { query, variables: { userId } }
  );
  return (data.websiteProjects?.items ?? []).map(toWebsiteProject);
}

export async function createWebsite(siteName: string, userId: string): Promise<WebsiteProject> {
  const mutation = `
    mutation CreateWebsite($input: WebsiteProjectInsertInput!) {
      insertWebsiteProject(input: $input) {
        _id
        userId
        siteName
      }
    }
  `;
  const data = await graphqlClient.mutate<{ insertWebsiteProject: WebsiteProjectRecord }>({
    query: mutation,
    variables: { input: { userId, siteName } },
  });
  return toWebsiteProject(data.insertWebsiteProject);
}

export async function deleteWebsite(siteId: string): Promise<void> {
  // siteId == _id in our mapping
  const mutation = `
    mutation DeleteWebsite($id: String!) {
      deleteWebsiteProject(filter: { id: { eq: $id } }) {
        isSuccess
      }
    }
  `;
  await graphqlClient.mutate({ query: mutation, variables: { id: siteId } });
}

// ---------------------------------------------------------------------------
// Page Layouts
// ---------------------------------------------------------------------------

export async function getSitePages(siteId: string): Promise<PageLayout[]> {
  const query = `
    query GetSitePages($siteId: String!) {
      pageLayouts(filter: { siteId: { eq: $siteId } }) {
        items {
          _id
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
  const data = await graphqlClient.query<{ pageLayouts: UdsListResponse<PageLayoutRecord> }>({
    query,
    variables: { siteId },
  });
  return (data.pageLayouts?.items ?? []).map(toPageLayout);
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
        _id
        pageId
        siteId
        userId
        slug
        isPublished
        components
      }
    }
  `;
  const data = await graphqlClient.mutate<{ insertPageLayout: PageLayoutRecord }>({
    query: mutation,
    variables: {
      input: {
        pageId,
        siteId,
        userId,
        slug: slug || pageName.toLowerCase().replace(/\s+/g, '-'),
        isPublished: false,
        components: JSON.stringify([]),
      },
    },
  });
  return toPageLayout(data.insertPageLayout);
}

export async function getPageLayout(pageId: string): Promise<PageLayout | null> {
  const query = `
    query GetPageLayout($pageId: String!) {
      pageLayouts(filter: { pageId: { eq: $pageId } }) {
        items {
          _id
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
  const data = await graphqlClient.query<{ pageLayouts: UdsListResponse<PageLayoutRecord> }>({
    query,
    variables: { pageId },
  });
  const item = data.pageLayouts?.items?.[0];
  return item ? toPageLayout(item) : null;
}

export async function savePageLayout(
  pageId: string,
  components: VibeComponent[]
): Promise<void> {
  const mutation = `
    mutation SavePageLayout($pageId: String!, $input: PageLayoutUpdateInput!) {
      updatePageLayout(filter: { pageId: { eq: $pageId } }, input: $input) {
        _id
        pageId
      }
    }
  `;
  await graphqlClient.mutate({
    query: mutation,
    variables: {
      pageId,
      input: { components: JSON.stringify(components) },
    },
  });
}

export async function publishPage(pageId: string, isPublished: boolean): Promise<void> {
  const mutation = `
    mutation PublishPage($pageId: String!, $input: PageLayoutUpdateInput!) {
      updatePageLayout(filter: { pageId: { eq: $pageId } }, input: $input) {
        _id
        pageId
        isPublished
      }
    }
  `;
  await graphqlClient.mutate({
    query: mutation,
    variables: { pageId, input: { isPublished } },
  });
}

export async function deletePage(pageId: string): Promise<void> {
  const mutation = `
    mutation DeletePage($pageId: String!) {
      deletePageLayout(filter: { pageId: { eq: $pageId } }) {
        isSuccess
      }
    }
  `;
  await graphqlClient.mutate({ query: mutation, variables: { pageId } });
}

// ---------------------------------------------------------------------------
// Public queries — no auth, used by the live renderer
// ---------------------------------------------------------------------------

export async function getPublicPageLayout(
  userId: string,
  slug: string
): Promise<PageLayout | null> {
  const query = `
    query GetPublicPage($userId: String!, $slug: String!) {
      pageLayouts(filter: {
        userId: { eq: $userId },
        slug: { eq: $slug },
        isPublished: { eq: true }
      }) {
        items {
          _id
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
  const data = await publicQuery<{ pageLayouts: UdsListResponse<PageLayoutRecord> }>(query, {
    userId,
    slug,
  });
  const item = data.pageLayouts?.items?.[0];
  return item ? toPageLayout(item) : null;
}

export async function getPublicSitePages(userId: string, siteId: string): Promise<PageLayout[]> {
  const query = `
    query GetPublicSitePages($userId: String!, $siteId: String!) {
      pageLayouts(filter: {
        userId: { eq: $userId },
        siteId: { eq: $siteId },
        isPublished: { eq: true }
      }) {
        items {
          _id
          pageId
          siteId
          userId
          slug
          isPublished
        }
      }
    }
  `;
  const data = await publicQuery<{ pageLayouts: UdsListResponse<PageLayoutRecord> }>(query, {
    userId,
    siteId,
  });
  return (data.pageLayouts?.items ?? []).map(toPageLayout);
}
