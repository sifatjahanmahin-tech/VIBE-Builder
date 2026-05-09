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
import { useAuthStore } from '@/state/store/auth';
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
// File Upload
// ---------------------------------------------------------------------------

export async function uploadImageFile(file: File): Promise<string> {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined ?? '').replace(/\/$/, '');
  const projectKey = import.meta.env.VITE_X_BLOCKS_KEY as string | undefined ?? '';
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = { 'x-blocks-key': projectKey };
  const fetchOpts: RequestInit = { method: 'POST', body: formData, headers };

  if (isLocalhost) {
    const token = useAuthStore.getState().accessToken;
    if (token) headers['Authorization'] = `bearer ${token}`;
  } else {
    fetchOpts.credentials = 'include';
  }

  const response = await fetch(`${baseUrl}/uds/v1/Files/UploadFile`, fetchOpts);

  if (!response.ok) {
    let detail = response.statusText;
    try { detail = await response.text(); } catch { /* use statusText */ }
    throw new Error(`Upload failed (${response.status}): ${detail}`);
  }

  const result = await response.json() as Record<string, unknown>;
  const url = (
    result.fileUrl ??
    (result.data as Record<string, unknown> | undefined)?.fileUrl ??
    result.url ??
    result.downloadUrl
  ) as string | undefined;

  if (!url) throw new Error('Upload succeeded but no file URL was returned');
  return url;
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
          primaryColor
          secondaryColor
          fontFamily
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
  return (data.getWebsiteProjects?.items ?? []).map((r) => toWebsiteProject(r, userId));
}

export async function getWebsiteProject(siteId: string): Promise<WebsiteProject | null> {
  const query = `
    query GetWebsiteProject($input: DynamicQueryInput) {
      getWebsiteProjects(input: $input) {
        items {
          ItemId
          userId
          siteName
          primaryColor
          secondaryColor
          fontFamily
        }
      }
    }
  `;
  const data = await graphqlClient.query<{ getWebsiteProjects: { items: any[] } }>({
    query,
    variables: {
      input: {
        filter: JSON.stringify({ _id: siteId }),
        sort: '{}',
        pageNo: 1,
        pageSize: 1,
      },
    },
  });
  const item = data.getWebsiteProjects?.items?.[0];
  return item ? toWebsiteProject(item, item.userId ?? '') : null;
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

export async function updateSiteDesign(
  siteId: string,
  design: { primaryColor?: string; secondaryColor?: string; fontFamily?: string }
): Promise<void> {
  const mutation = `
    mutation UpdateSiteDesign($filter: String!, $input: WebsiteProjectUpdateInput!) {
      updateWebsiteProject(filter: $filter, input: $input) {
        totalImpactedData
        acknowledged
      }
    }
  `;
  await graphqlClient.mutate({
    query: mutation,
    variables: {
      filter: JSON.stringify({ _id: siteId }),
      input: design,
    },
  });
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

const PAGE_LAYOUT_FIELDS = `
  ItemId
  pageId
  siteId
  userId
  pageName
  slug
  isPublished
  components
  seoTitle
  seoDescription
  ogImage
  customCss
  customJs
`;

export async function getSitePages(siteId: string): Promise<PageLayout[]> {
  const query = `
    query GetSitePages($input: DynamicQueryInput) {
      getPageLayouts(input: $input) {
        totalCount
        items {
          ${PAGE_LAYOUT_FIELDS}
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
          ${PAGE_LAYOUT_FIELDS}
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

export interface PageMeta {
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  customCss?: string;
  customJs?: string;
}

export async function savePageLayout(
  pageId: string,
  components: VibeComponent[],
  meta?: PageMeta
): Promise<void> {
  const mutation = `
    mutation SavePageLayout($filter: String!, $input: PageLayoutUpdateInput!) {
      updatePageLayout(filter: $filter, input: $input) {
        totalImpactedData
        acknowledged
      }
    }
  `;
  const input: Record<string, unknown> = { components: JSON.stringify(components) };
  if (meta) {
    if (meta.seoTitle !== undefined) input.seoTitle = meta.seoTitle;
    if (meta.seoDescription !== undefined) input.seoDescription = meta.seoDescription;
    if (meta.ogImage !== undefined) input.ogImage = meta.ogImage;
    if (meta.customCss !== undefined) input.customCss = meta.customCss;
    if (meta.customJs !== undefined) input.customJs = meta.customJs;
  }
  await graphqlClient.mutate({
    query: mutation,
    variables: {
      filter: JSON.stringify({ pageId }),
      input,
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

export async function updatePageSlug(pageId: string, slug: string): Promise<void> {
  const mutation = `
    mutation UpdatePageSlug($filter: String!, $input: PageLayoutUpdateInput!) {
      updatePageLayout(filter: $filter, input: $input) {
        totalImpactedData acknowledged
      }
    }
  `;
  await graphqlClient.mutate({
    query: mutation,
    variables: { filter: JSON.stringify({ pageId }), input: { slug } },
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
// Shared response mappers
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
    seoTitle: r.seoTitle ?? '',
    seoDescription: r.seoDescription ?? '',
    ogImage: r.ogImage ?? '',
    customCss: r.customCss ?? '',
    customJs: r.customJs ?? '',
  };
}

function toWebsiteProject(r: any, fallbackUserId: string): WebsiteProject {
  return {
    _id: r.ItemId,
    siteId: r.ItemId,
    userId: r.userId ?? fallbackUserId,
    siteName: r.siteName ?? '',
    primaryColor: r.primaryColor ?? '',
    secondaryColor: r.secondaryColor ?? '',
    fontFamily: r.fontFamily ?? '',
  };
}

export async function duplicatePage(
  sourcePageId: string,
  siteId: string,
  userId: string,
  newName: string,
  newSlug: string
): Promise<PageLayout> {
  const [source, newPage] = await Promise.all([
    getPageLayout(sourcePageId),
    createPage(siteId, userId, newName, newSlug),
  ]);
  if (source && source.components.length > 0) {
    const newComponents = source.components.map((c) => ({ ...c, id: uuidv4() }));
    await savePageLayout(newPage.pageId, newComponents);
    newPage.components = newComponents;
  }
  return newPage;
}

// ---------------------------------------------------------------------------
// Renderer queries (public-facing, uses authenticated graphqlClient)
// ---------------------------------------------------------------------------

export async function getPublicPageLayout(
  userId: string,
  slug: string
): Promise<PageLayout | null> {
  const query = `
    query GetPublicPage($input: DynamicQueryInput) {
      getPageLayouts(input: $input) {
        items {
          ${PAGE_LAYOUT_FIELDS}
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

export async function getPublicWebsiteProject(siteId: string): Promise<WebsiteProject | null> {
  const query = `
    query GetPublicWebsiteProject($input: DynamicQueryInput) {
      getWebsiteProjects(input: $input) {
        items {
          ItemId
          userId
          siteName
          primaryColor
          secondaryColor
          fontFamily
        }
      }
    }
  `;
  const data = await graphqlClient.query<{ getWebsiteProjects: { items: any[] } }>({
    query,
    variables: {
      input: {
        filter: JSON.stringify({ _id: siteId }),
        sort: '{}',
        pageNo: 1,
        pageSize: 1,
      },
    },
  });
  const item = data.getWebsiteProjects?.items?.[0];
  return item ? toWebsiteProject(item, '') : null;
}
