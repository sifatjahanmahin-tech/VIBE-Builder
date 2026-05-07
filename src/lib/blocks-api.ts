/**
 * VibeBuilder — Blocks GraphQL API
 *
 * Endpoint : /uds/v1/{projectSlug}/gateway  (Selise Unified Data Service)
 * Schemas  : WebsiteProject, PageLayout
 *
 * Query fields  : get[SchemaName]s  (WebsiteProject → getWebsiteProjects)
 * Mutations     : insert/update/delete[SchemaName]  (insertWebsiteProject …)
 * Insert resp   : { itemId, totalImpactedData, acknowledged }
 * Update/Delete : { totalImpactedData, acknowledged }
 * Filter        : JSON.stringify({ field: value })
 */

import { v4 as uuidv4 } from 'uuid';
import { graphqlClient } from './graphql-client';
import { PageLayout, VibeComponent, WebsiteProject } from '@/types/vibebuilder';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseComponents(raw: string | null | undefined): VibeComponent[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as VibeComponent[]; }
  catch { return []; }
}

function formatSlugAsName(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}


// ---------------------------------------------------------------------------
// Website Projects
// ---------------------------------------------------------------------------

export async function getMyWebsites(userId: string): Promise<WebsiteProject[]> {
  const query = `
    query GetMyWebsites($input: DynamicQueryInput) {
      getWebsiteProjects(input: $input) {
        totalCount
        items {
          ItemId
          userId
          siteName
        }
      }
    }
  `;
  const data = await graphqlClient.query<{ getWebsiteProjects: { items: any[] } }>({
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
  return (data.getWebsiteProjects?.items ?? []).map((r) => ({
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
  const data = await graphqlClient.mutate<{
    insertWebsiteProject: { itemId: string; totalImpactedData: number; acknowledged: boolean };
  }>({
    query: mutation,
    variables: { input: { userId, siteName } },
  });
  const itemId = data.insertWebsiteProject.itemId;
  return { _id: itemId, siteId: itemId, userId, siteName };
}

export async function deleteWebsite(siteId: string): Promise<void> {
  try {
    const pages = await getSitePages(siteId);
    await Promise.all(pages.map((p) => deletePage(p.pageId)));
  } catch {
    // best-effort cascade
  }

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
      getPageLayouts(input: $input) {
        totalCount
        items {
          ItemId
          pageId
          siteId
          userId
          pageName
          slug
          isPublished
          components
        }
      }
    }
  `;
  const data = await graphqlClient.query<{ getPageLayouts: { items: any[] } }>({
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
  return (data.getPageLayouts?.items ?? []).map(toPageLayout);
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
        pageName,
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
    pageName,
    slug: pageSlug,
    isPublished: false,
    components: [],
  };
}

export async function getPageLayout(pageId: string): Promise<PageLayout | null> {
  const query = `
    query GetPageLayout($input: DynamicQueryInput) {
      getPageLayouts(input: $input) {
        items {
          ItemId
          pageId
          siteId
          userId
          pageName
          slug
          isPublished
          components
        }
      }
    }
  `;
  const data = await graphqlClient.query<{ getPageLayouts: { items: any[] } }>({
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
  const item = data.getPageLayouts?.items?.[0];
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

export async function renamePage(pageId: string, pageName: string): Promise<void> {
  const mutation = `
    mutation RenamePage($filter: String!, $input: PageLayoutUpdateInput!) {
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
      input: { pageName },
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
  const slug = r.slug ?? r.pageId ?? '';
  const pageName = r.pageName || formatSlugAsName(slug);
  return {
    _id: r.ItemId ?? r.pageId,
    pageId: r.pageId,
    siteId: r.siteId,
    userId: r.userId,
    pageName,
    slug,
    isPublished: r.isPublished ?? false,
    components: parseComponents(r.components),
  };
}

// ---------------------------------------------------------------------------
// Renderer queries — use the same authenticated graphqlClient as all other
// modules (credentials:'include' on the deployed domain handles session auth)
// ---------------------------------------------------------------------------

export async function getPublicPageLayout(
  userId: string,
  slug: string
): Promise<PageLayout | null> {
  const query = `
    query GetPublicPage($input: DynamicQueryInput) {
      getPageLayouts(input: $input) {
        items {
          ItemId
          pageId
          siteId
          userId
          pageName
          slug
          isPublished
          components
        }
      }
    }
  `;
  const data = await graphqlClient.query<{ getPageLayouts: { items: any[] } }>({
    query,
    variables: {
      input: {
        filter: JSON.stringify({ userId, slug, isPublished: true }),
        sort: '{}',
        pageNo: 1,
        pageSize: 1,
      },
    },
  });
  const item = data.getPageLayouts?.items?.[0];
  return item ? toPageLayout(item) : null;
}

export async function getPublicSitePages(userId: string, siteId: string): Promise<PageLayout[]> {
  const query = `
    query GetPublicSitePages($input: DynamicQueryInput) {
      getPageLayouts(input: $input) {
        items {
          ItemId
          pageId
          siteId
          userId
          pageName
          slug
          isPublished
        }
      }
    }
  `;
  const data = await graphqlClient.query<{ getPageLayouts: { items: any[] } }>({
    query,
    variables: {
      input: {
        filter: JSON.stringify({ userId, siteId, isPublished: true }),
        sort: '{}',
        pageNo: 1,
        pageSize: 100,
      },
    },
  });
  return (data.getPageLayouts?.items ?? []).map(toPageLayout);
}
