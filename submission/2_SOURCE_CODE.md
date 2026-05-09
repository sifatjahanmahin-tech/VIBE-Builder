# VibeBuilder — Source Code Reference

The 13 most important source files are included below in full.

---

## File: src/types/vibebuilder.ts

```typescript
export enum ComponentType {
  Hero = 'Hero',
  TextBlock = 'TextBlock',
  ImageGallery = 'ImageGallery',
  ContactForm = 'ContactForm',
  Testimonial = 'Testimonial',
  FeaturesGrid = 'FeaturesGrid',
  CTABanner = 'CTABanner',
  Navbar = 'Navbar',
  Footer = 'Footer',
}

export type TextAlignment = 'left' | 'center' | 'right' | 'justify';
export type ContactFormFieldType = 'text' | 'email' | 'textarea' | 'tel';

export interface HeroSectionProps {
  heading: string;
  subtext: string;
  bgColor: string;
  imageUrl: string;
  ctaText: string;
  alignment?: 'left' | 'center' | 'right';
  overlayOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
}

export interface TextBlockProps {
  content: string;
  fontSize: string;
  textColor: string;
  alignment: TextAlignment;
}

export interface ImageGalleryProps {
  images: string[];
  columns: number;
  gap: number;
}

export interface ContactFormField {
  name: string;
  label: string;
  type: ContactFormFieldType;
  required: boolean;
}

export interface ContactFormProps {
  title: string;
  fields: ContactFormField[];
  submitText: string;
  webhookUrl?: string;
}

export interface TestimonialProps {
  quote: string;
  authorName: string;
  authorRole: string;
  authorImage: string;
  bgColor: string;
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesGridProps {
  title: string;
  features: FeatureItem[];
}

export interface CTABannerProps {
  heading: string;
  subtext: string;
  buttonText: string;
  buttonUrl: string;
  bgColor: string;
  textColor: string;
}

export interface NavLink {
  label: string;
  url: string;
}

export interface NavbarProps {
  siteName: string;
  logoText: string;
  links: NavLink[];
  bgColor: string;
  textColor: string;
}

export interface FooterProps {
  companyName: string;
  copyright: string;
  links: NavLink[];
  bgColor: string;
  textColor: string;
}

export type VibeComponentProps =
  | HeroSectionProps
  | TextBlockProps
  | ImageGalleryProps
  | ContactFormProps
  | TestimonialProps
  | FeaturesGridProps
  | CTABannerProps
  | NavbarProps
  | FooterProps;

export interface VibeComponent {
  id: string;
  type: ComponentType;
  order: number;
  props: VibeComponentProps;
}

export interface PageLayout {
  _id?: string;
  pageId: string;
  siteId: string;
  userId: string;
  pageName: string;
  slug: string;
  isPublished: boolean;
  components: VibeComponent[];
  // SEO fields
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  // Custom code fields
  customCss?: string;
  customJs?: string;
}

export interface WebsiteProject {
  _id?: string;
  siteId: string;
  userId: string;
  siteName: string;
  // Global design fields
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

export type PartialProps<T extends VibeComponentProps> = Partial<T>;

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  description: string;
  defaultProps: VibeComponentProps;
}

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  {
    type: ComponentType.Navbar,
    label: 'Navbar',
    description: 'Site navigation bar with logo and links',
    defaultProps: {
      siteName: 'My Site',
      logoText: 'M',
      links: [
        { label: 'Home', url: '#' },
        { label: 'About', url: '#about' },
        { label: 'Contact', url: '#contact' },
      ],
      bgColor: '#1a1a1a',
      textColor: '#ffffff',
    } satisfies NavbarProps,
  },
  {
    type: ComponentType.Footer,
    label: 'Footer',
    description: 'Site footer with links and copyright',
    defaultProps: {
      companyName: 'My Company',
      copyright: `© ${new Date().getFullYear()} My Company. All rights reserved.`,
      links: [
        { label: 'Privacy', url: '#' },
        { label: 'Terms', url: '#' },
      ],
      bgColor: '#111111',
      textColor: '#888888',
    } satisfies FooterProps,
  },
  {
    type: ComponentType.Hero,
    label: 'Hero Section',
    description: 'Full-width banner with heading, subtext and CTA',
    defaultProps: {
      heading: 'Welcome to Your Site',
      subtext: 'Describe what you do in one compelling sentence.',
      bgColor: '#1a1a2e',
      imageUrl: '',
      ctaText: 'Get Started',
      alignment: 'left',
      overlayOpacity: 0.3,
    } satisfies HeroSectionProps,
  },
  {
    type: ComponentType.TextBlock,
    label: 'Text Block',
    description: 'Rich paragraph with font and alignment controls',
    defaultProps: {
      content: 'Enter your text here...',
      fontSize: '16px',
      textColor: '#333333',
      alignment: 'left',
    } satisfies TextBlockProps,
  },
  {
    type: ComponentType.ImageGallery,
    label: 'Image Gallery',
    description: 'Responsive grid of images with captions',
    defaultProps: {
      images: ['https://picsum.photos/400/300?random=1'],
      columns: 3,
      gap: 16,
    } satisfies ImageGalleryProps,
  },
  {
    type: ComponentType.ContactForm,
    label: 'Contact Form',
    description: 'Customizable form to collect visitor messages',
    defaultProps: {
      title: 'Contact Us',
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: false },
      ],
      submitText: 'Send Message',
      webhookUrl: '',
    } satisfies ContactFormProps,
  },
  {
    type: ComponentType.Testimonial,
    label: 'Testimonial',
    description: 'Customer quote card with avatar and attribution',
    defaultProps: {
      quote: 'This product changed everything for us. Absolutely incredible service and results!',
      authorName: 'Jane Smith',
      authorRole: 'CEO, Example Co.',
      authorImage: '',
      bgColor: '#1e293b',
    } satisfies TestimonialProps,
  },
  {
    type: ComponentType.FeaturesGrid,
    label: 'Features Grid',
    description: '3-column grid showcasing product features',
    defaultProps: {
      title: 'Why Choose Us',
      features: [
        { icon: '⚡', title: 'Lightning Fast', description: 'Optimised for speed from the ground up.' },
        { icon: '🎨', title: 'Beautiful Design', description: 'Stunning visuals that impress every visitor.' },
        { icon: '🔒', title: 'Secure & Reliable', description: 'Enterprise-grade security built right in.' },
      ],
    } satisfies FeaturesGridProps,
  },
  {
    type: ComponentType.CTABanner,
    label: 'CTA Banner',
    description: 'Full-width call-to-action with a prominent button',
    defaultProps: {
      heading: 'Ready to get started?',
      subtext: 'Join thousands of happy customers today.',
      buttonText: 'Get Started Free',
      buttonUrl: '#',
      bgColor: '#4f46e5',
      textColor: '#ffffff',
    } satisfies CTABannerProps,
  },
];
```

---

## File: src/lib/blocks-api.ts

```typescript
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
```

---

## File: src/modules/editor/hooks/use-editor.ts

```typescript
import { useCallback, useEffect, useRef, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import { COMPONENT_DEFINITIONS } from '@/types/vibebuilder';
import type { ComponentType, VibeComponent, VibeComponentProps } from '@/types/vibebuilder';
import {
  getPageLayout, savePageLayout, publishPage, renamePage,
  getWebsiteProject, updateSiteDesign,
} from '@/lib/blocks-api';
import { useToast } from '@/hooks/use-toast';

const AUTO_SAVE_MS = 30_000;
const MAX_HISTORY = 50;

export function useEditor(pageId: string) {
  const { toast } = useToast();

  const [components, setComponents] = useState<VibeComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageName, setPageName] = useState('');
  const [siteId, setSiteId] = useState('');
  const [slug, setSlug] = useState('');

  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [customCss, setCustomCss] = useState('');
  const [customJs, setCustomJs] = useState('');

  const [primaryColor, setPrimaryColor] = useState('#FF6B35');
  const [secondaryColor, setSecondaryColor] = useState('#1A1A2E');
  const [fontFamily, setFontFamily] = useState('system-ui, sans-serif');

  const undoStack = useRef<VibeComponent[][]>([]);
  const redoStack = useRef<VibeComponent[][]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pushHistory(snapshot: VibeComponent[]) {
    undoStack.current = [...undoStack.current.slice(-(MAX_HISTORY - 1)), [...snapshot]];
    redoStack.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }

  useEffect(() => {
    if (!pageId) return;
    setIsLoading(true);

    getPageLayout(pageId)
      .then(async (layout) => {
        if (!layout) return;

        setComponents(layout.components);
        setIsPublished(layout.isPublished);
        setPageName(layout.pageName);
        setSiteId(layout.siteId);
        setSlug(layout.slug);

        setSeoTitle(layout.seoTitle ?? '');
        setSeoDescription(layout.seoDescription ?? '');
        setOgImage(layout.ogImage ?? '');
        setCustomCss(layout.customCss ?? '');
        setCustomJs(layout.customJs ?? '');

        try {
          const site = await getWebsiteProject(layout.siteId);
          if (site) {
            if (site.primaryColor) setPrimaryColor(site.primaryColor);
            if (site.secondaryColor) setSecondaryColor(site.secondaryColor);
            if (site.fontFamily) setFontFamily(site.fontFamily);
          }
        } catch {
          // site design is non-critical — fall back to defaults
        }
      })
      .finally(() => setIsLoading(false));
  }, [pageId]);

  useEffect(() => {
    if (!isDirty) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      void handleSave();
    }, AUTO_SAVE_MS);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components, isDirty]);

  const handleSave = useCallback(async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setIsSaving(true);
    try {
      await savePageLayout(pageId, components, {
        seoTitle, seoDescription, ogImage, customCss, customJs,
      });
      setIsDirty(false);
      toast({ title: 'Saved', description: 'Page saved successfully.' });
    } catch (err) {
      toast({ title: 'Save failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [pageId, components, seoTitle, seoDescription, ogImage, customCss, customJs, toast]);

  const handlePublishToggle = useCallback(async () => {
    const next = !isPublished;
    setIsPublished(next);
    try {
      await publishPage(pageId, next);
      toast({
        title: next ? 'Page published!' : 'Page unpublished',
        description: next ? 'Your page is now live.' : 'Your page is now in draft mode.',
      });
    } catch (err) {
      setIsPublished(!next);
      toast({ title: 'Failed to update publish status', description: (err as Error).message, variant: 'destructive' });
    }
  }, [pageId, isPublished, toast]);

  const updatePageMeta = useCallback((patch: {
    seoTitle?: string; seoDescription?: string; ogImage?: string;
    customCss?: string; customJs?: string;
  }) => {
    if (patch.seoTitle !== undefined) setSeoTitle(patch.seoTitle);
    if (patch.seoDescription !== undefined) setSeoDescription(patch.seoDescription);
    if (patch.ogImage !== undefined) setOgImage(patch.ogImage);
    if (patch.customCss !== undefined) setCustomCss(patch.customCss);
    if (patch.customJs !== undefined) setCustomJs(patch.customJs);
    setIsDirty(true);
  }, []);

  const handleUpdateSiteDesign = useCallback(async (patch: {
    primaryColor?: string; secondaryColor?: string; fontFamily?: string;
  }) => {
    if (patch.primaryColor !== undefined) setPrimaryColor(patch.primaryColor);
    if (patch.secondaryColor !== undefined) setSecondaryColor(patch.secondaryColor);
    if (patch.fontFamily !== undefined) setFontFamily(patch.fontFamily);
    if (!siteId) return;
    try {
      await updateSiteDesign(siteId, patch);
    } catch (err) {
      toast({ title: 'Failed to save design', description: (err as Error).message, variant: 'destructive' });
    }
  }, [siteId, toast]);

  const addComponent = useCallback((type: ComponentType) => {
    const def = COMPONENT_DEFINITIONS.find((d) => d.type === type);
    if (!def) return;
    setComponents((prev) => {
      pushHistory(prev);
      const newItem: VibeComponent = {
        id: uuidv4(), type, order: prev.length,
        props: { ...def.defaultProps },
      };
      setSelectedId(newItem.id);
      setIsDirty(true);
      return [...prev, newItem];
    });
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => {
      pushHistory(prev);
      setSelectedId((sel) => (sel === id ? null : sel));
      setIsDirty(true);
      return prev.filter((c) => c.id !== id);
    });
  }, []);

  const duplicateComponent = useCallback((id: string) => {
    setComponents((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      pushHistory(prev);
      const original = prev[idx];
      const clone: VibeComponent = {
        ...original,
        id: uuidv4(),
        order: idx + 1,
        props: JSON.parse(JSON.stringify(original.props)) as VibeComponent['props'],
      };
      const next = [
        ...prev.slice(0, idx + 1),
        clone,
        ...prev.slice(idx + 1),
      ].map((c, i) => ({ ...c, order: i }));
      setSelectedId(clone.id);
      setIsDirty(true);
      return next;
    });
  }, []);

  const updateComponentProps = useCallback(
    (id: string, patch: Partial<VibeComponentProps>) => {
      setComponents((prev) => {
        pushHistory(prev);
        setIsDirty(true);
        return prev.map((c) => (c.id === id ? { ...c, props: { ...c.props, ...patch } as VibeComponentProps } : c));
      });
    },
    []
  );

  const setComponentsBatch = useCallback((next: VibeComponent[]) => {
    setComponents((prev) => {
      pushHistory(prev);
      setIsDirty(true);
      return next;
    });
    setSelectedId(null);
  }, []);

  const undo = useCallback(() => {
    const snapshot = undoStack.current.pop();
    if (!snapshot) return;
    setComponents((cur) => {
      redoStack.current = [...redoStack.current, [...cur]];
      setCanUndo(undoStack.current.length > 0);
      setCanRedo(true);
      setIsDirty(true);
      return snapshot;
    });
  }, []);

  const redo = useCallback(() => {
    const snapshot = redoStack.current.pop();
    if (!snapshot) return;
    setComponents((cur) => {
      undoStack.current = [...undoStack.current, [...cur]];
      setCanUndo(true);
      setCanRedo(redoStack.current.length > 0);
      setIsDirty(true);
      return snapshot;
    });
  }, []);

  const handleRenamePage = useCallback(async (newName: string) => {
    setPageName(newName);
    try {
      await renamePage(pageId, newName);
    } catch (err) {
      toast({ title: 'Failed to rename page', description: (err as Error).message, variant: 'destructive' });
    }
  }, [pageId, toast]);

  const reorderComponents = useCallback((activeId: string, overId: string) => {
    setComponents((prev) => {
      pushHistory(prev);
      const oldIndex = prev.findIndex((c) => c.id === activeId);
      const newIndex = prev.findIndex((c) => c.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      setIsDirty(true);
      return arrayMove(prev, oldIndex, newIndex).map((c, i) => ({ ...c, order: i }));
    });
  }, []);

  const selectedComponent = components.find((c) => c.id === selectedId) ?? null;

  return {
    components, selectedId, selectedComponent, isPublished,
    isDirty, isSaving, isLoading, pageName, siteId, slug,
    seoTitle, seoDescription, ogImage,
    customCss, customJs,
    primaryColor, secondaryColor, fontFamily,
    canUndo, canRedo,
    setSelectedId, setPageName, setSlug,
    addComponent, removeComponent, duplicateComponent, updateComponentProps, setComponentsBatch,
    reorderComponents, handleSave, handlePublishToggle, handleRenamePage,
    undo, redo, updatePageMeta, handleUpdateSiteDesign,
  };
}
```

---

## File: src/modules/editor/pages/editor-page.tsx

```typescript
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor } from '../hooks/use-editor';
import { EditorTopbar } from '../components/editor-topbar';
import type { Viewport } from '../components/editor-topbar';
import { ComponentPalette } from '../components/component-palette';
import { EditorCanvas } from '../components/editor-canvas';
import { PropertyEditor } from '../components/property-editor';
import { AIAssistantPanel } from '../components/ai-assistant-panel';
import { KeyboardShortcutsModal } from '../components/keyboard-shortcuts-modal';
import { deletePage, updatePageSlug } from '@/lib/blocks-api';

export function EditorPage() {
  const { siteId = '', pageId = '' } = useParams<{ siteId: string; pageId: string }>();
  const navigate = useNavigate();

  const [previewMode, setPreviewMode] = useState(false);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [showAI, setShowAI] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const {
    components, selectedId, selectedComponent,
    isPublished, isDirty, isSaving, isLoading,
    pageName, slug,
    seoTitle, seoDescription, ogImage,
    customCss, customJs,
    primaryColor, secondaryColor, fontFamily,
    canUndo, canRedo,
    setSelectedId, setPageName, setSlug,
    addComponent, removeComponent, duplicateComponent, updateComponentProps,
    setComponentsBatch, reorderComponents,
    handleSave, handlePublishToggle, handleRenamePage,
    undo, redo, updatePageMeta, handleUpdateSiteDesign,
  } = useEditor(pageId);

  useEffect(() => {
    document.title = pageName ? `${pageName} — VibeBuilder` : 'VibeBuilder';
    return () => { document.title = 'VibeBuilder'; };
  }, [pageName]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if (ctrl && e.key === 's') { e.preventDefault(); if (isDirty && !isSaving) void handleSave(); }
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if (ctrl && e.key === 'p') { e.preventDefault(); void handlePublishToggle(); }
      if (ctrl && e.key === 'd') { e.preventDefault(); if (selectedId) duplicateComponent(selectedId); }

      if (!inInput) {
        if (e.key === 'Escape') { setSelectedId(null); setShowAI(false); setShowShortcuts(false); }
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
          removeComponent(selectedId);
        }
        if (e.key === '?') { setShowShortcuts((v) => !v); }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDirty, isSaving, handleSave, undo, redo, handlePublishToggle, selectedId, duplicateComponent, removeComponent, setSelectedId]);

  async function handleUpdateSlug(newSlug: string) {
    setSlug(newSlug);
    await updatePageSlug(pageId, newSlug);
  }

  async function handleDeletePage() {
    await deletePage(pageId);
    navigate('/vibe-dashboard');
  }

  function handleExport() {
    const filename = `${slug || 'page'}-export.json`;
    const blob = new Blob([JSON.stringify(components, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() { importRef.current?.click(); }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (Array.isArray(parsed)) setComponentsBatch(parsed);
      } catch { /* ignore invalid JSON */ }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999, backgroundColor: '#1A1A1A' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#FF6B35', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: '#666' }}>Loading editor…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="lg:hidden fixed inset-0 flex flex-col items-center justify-center gap-4 text-center px-8"
        style={{ zIndex: 99999, backgroundColor: '#1A1A1A' }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: 12, backgroundColor: '#FF6B3520',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>
          🖥️
        </div>
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 8 }}>
            Editor works best on desktop
          </p>
          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
            Please open VibeBuilder on a screen wider than 1024px for the best experience.
          </p>
        </div>
      </div>

      <div
        className="hidden lg:flex fixed inset-0 flex-col overflow-hidden"
        style={{ zIndex: 9999, backgroundColor: '#1A1A1A' }}
      >
        <input ref={importRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleImportFile} />

        <EditorTopbar
          pageName={pageName} slug={slug} isDirty={isDirty} isSaving={isSaving}
          isPublished={isPublished} previewMode={previewMode}
          viewport={viewport} showAI={showAI} canUndo={canUndo} canRedo={canRedo}
          onSave={handleSave} onPublishToggle={handlePublishToggle}
          onPreviewToggle={() => setPreviewMode((p) => !p)}
          onRenamePage={handleRenamePage} setPageName={setPageName}
          onViewportChange={setViewport} onAIToggle={() => setShowAI((v) => !v)}
          onUndo={undo} onRedo={redo} onExport={handleExport} onImportClick={handleImportClick}
          onShowShortcuts={() => setShowShortcuts((v) => !v)}
        />

        <div className="flex flex-1 overflow-hidden" style={{ position: 'relative' }}>
          {!previewMode && (
            <ComponentPalette
              onAdd={addComponent}
              siteId={siteId} pageId={pageId} slug={slug} pageName={pageName}
              seoTitle={seoTitle} seoDescription={seoDescription} ogImage={ogImage}
              customCss={customCss} customJs={customJs}
              primaryColor={primaryColor} secondaryColor={secondaryColor} fontFamily={fontFamily}
              onUpdateSlug={handleUpdateSlug}
              onDeletePage={handleDeletePage}
              onUpdatePageMeta={updatePageMeta}
              onUpdateSiteDesign={handleUpdateSiteDesign}
            />
          )}

          <EditorCanvas
            components={components} selectedId={selectedId}
            previewMode={previewMode} viewport={viewport}
            onSelect={setSelectedId} onRemove={removeComponent}
            onReorder={reorderComponents} onDuplicate={duplicateComponent}
          />

          {!previewMode && (
            <PropertyEditor
              component={selectedComponent}
              onChange={(patch) => selectedId && updateComponentProps(selectedId, patch)}
            />
          )}

          {!previewMode && (
            <AIAssistantPanel
              isOpen={showAI} onClose={() => setShowAI(false)}
              selectedComponent={selectedComponent}
              components={components}
              onSetComponents={setComponentsBatch}
              onUpdateProps={(patch) => selectedId && updateComponentProps(selectedId, patch)}
            />
          )}
        </div>
      </div>

      <KeyboardShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </>
  );
}
```

---

## File: src/modules/editor/components/editor-canvas.tsx

*[Full content — 321 lines — see repository: src/modules/editor/components/editor-canvas.tsx]*

The EditorCanvas renders a dnd-kit SortableContext with one `SortableComponent` per block. Each `SortableComponent` wraps the rendered vibe component with:
- Orange 2px selection outline (absolute inset)
- Orange label chip top-left (component type name)
- Hover outline (semi-transparent orange, opacity-0 → group-hover:opacity-100)
- Drag handle button (⠿) top-left on hover
- Duplicate button (Copy icon) top-right on hover
- Delete button (✕) top-right on hover
- `pointer-events: none` on the inner rendered component so clicks propagate to wrapper

Viewport max-width is enforced via `VIEWPORT_MAX = { desktop: 1100, tablet: 768, mobile: 390 }`.

---

## File: src/modules/editor/components/component-palette.tsx

*[Full content — 645 lines — see repository: src/modules/editor/components/component-palette.tsx]*

Three-tab panel (Elements / Pages / Settings):
- **Elements**: Search box, Recently Used section, Favorites (★) section, categorised component tiles with star toggle
- **Pages**: Page list with Live/Draft badges, Duplicate/Delete per page, "New Page" button, AddPageModal
- **Settings**: URL slug, SEO fields, 6 Quick Themes grid, Global Design (colors + font), Custom CSS/JS, Danger Zone (delete page)

---

## File: src/modules/editor/components/property-editor.tsx

*[Full content — 757 lines — see repository: src/modules/editor/components/property-editor.tsx]*

Per-component-type forms using shared primitives: `DInput`, `DTextarea`, `DSelect`, `DColorField`, `ImageUploadInput`, `NavLinkEditor`. All wrapped in collapsible `Section` components with ChevronRight animation. Empty state shown when no component is selected.

---

## File: src/modules/editor/components/editor-topbar.tsx

*[Full content — 307 lines — see repository: src/modules/editor/components/editor-topbar.tsx]*

56px dark topbar with: orange "V" logo (→ dashboard), editable page name, save status (Cloud/Loader2 + text), undo/redo, viewport toggle (Desktop/Tablet/Mobile), AI button, Keyboard shortcuts button, Export/Import, Preview toggle, Draft/Published pill, Save button, orange Publish button, external link button.

---

## File: src/modules/editor/components/ai-assistant-panel.tsx

```typescript
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X, Sparkles, Send, Wand2, Palette, FileText, Zap, AlertCircle } from 'lucide-react';
import type { VibeComponent, VibeComponentProps } from '@/types/vibebuilder';

// Fallback key is safe here: VITE_* vars are always bundled into the browser JS.
const GEMINI_FALLBACK = 'AIzaSyDAEN4UmWtEJxc1FLw_0lOlagIyyb_C278';

async function callGemini(systemPrompt: string, userMessage: string): Promise<string> {
  const envKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined ?? '').trim();
  const apiKey = (envKey && envKey !== 'undefined') ? envKey : GEMINI_FALLBACK;
  if (!apiKey) throw new Error('Gemini API key is not configured');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userMessage }] }],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = (err as any)?.error?.message ?? `Gemini API error ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json() as { candidates?: { content: { parts: { text: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) throw new Error('Gemini returned an empty response. Try again.');
  return text;
}

const PAGE_GEN_SYSTEM = `You are a professional website builder AI. Generate complete, high-quality website page layouts as JSON.

Return ONLY a valid JSON array of components. No explanation, no markdown fences, just the raw JSON array.

Each component must be:
{
  "id": "<unique short string like 'c1','c2'>",
  "type": "<ComponentType>",
  "order": <integer starting 0>,
  "props": { <component props> }
}

Available types and their props:
- "Navbar": { siteName, logoText, links:[{label,url}], bgColor, textColor }
- "Hero": { heading, subtext, ctaText, bgColor, imageUrl:"", alignment:"left"|"center"|"right", overlayOpacity:0.3 }
- "TextBlock": { content, fontSize:"16px", textColor:"#333333", alignment:"left" }
- "FeaturesGrid": { title, features:[{icon,title,description}] }
- "Testimonial": { quote, authorName, authorRole, authorImage:"", bgColor }
- "CTABanner": { heading, subtext, buttonText, buttonUrl:"#", bgColor, textColor }
- "ContactForm": { title, submitText, fields:[{name,label,type:"text"|"email"|"textarea",required:true}], webhookUrl:"" }
- "ImageGallery": { images:["https://picsum.photos/400/300"], columns:3, gap:16 }
- "Footer": { companyName, copyright, links:[{label,url}], bgColor:"#111111", textColor:"#888888" }

Rules:
1. Start with Navbar (order 0), end with Footer (last order)
2. Always include a Hero section
3. Use realistic, compelling content for the described business
4. Use professional color schemes that match the business type
5. Return ONLY the JSON array`;

const COPY_SYSTEM = `You are a professional copywriter. Rewrite the text content of a website component.
Return ONLY a JSON object with improved text props — same keys as the input, only text values changed. No markdown, no explanation.`;

const PALETTE_SYSTEM = `You are a designer. Return ONLY a JSON object with these exact keys:
{"primaryColor":"#hex","secondaryColor":"#hex","bgColor":"#hex","textColor":"#hex","accentColor":"#hex"}
All values must be valid hex colors. No explanation, no markdown.`;

const IMPROVE_SYSTEM = `You are a professional web copywriter and UX expert. Improve the website page components.
Return ONLY the improved JSON array with the same structure as the input. No explanation, no markdown fences.
Improvements: better headings, more compelling copy, ensure all sections are filled, fix empty fields.
Keep the same component types, ids, and order. Return ONLY the JSON array.`;

function extractJSON(text: string): unknown {
  const trimmed = text.trim();
  try { return JSON.parse(trimmed); } catch { /* fall through */ }
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try { return JSON.parse(fenced[1].trim()); } catch { /* fall through */ }
  }
  const start = trimmed.search(/[{[]/);
  if (start >= 0) {
    const last = Math.max(trimmed.lastIndexOf(']'), trimmed.lastIndexOf('}'));
    if (last > start) {
      try { return JSON.parse(trimmed.slice(start, last + 1)); } catch { /* fall through */ }
    }
  }
  throw new Error("AI couldn't generate a valid layout. Try being more specific.");
}

function normalizeComponents(raw: unknown): VibeComponent[] {
  if (!Array.isArray(raw)) throw new Error("AI couldn't generate a valid layout. Try being more specific.");
  return (raw as any[]).map((item, i) => ({
    id: item.id ?? uuidv4(),
    type: item.type,
    order: typeof item.order === 'number' ? item.order : i,
    props: item.props ?? {},
  })) as VibeComponent[];
}

// [Full component implementation — see repository for complete render tree]
// Key: hasApiKey = true (always available via GEMINI_FALLBACK)
// Actions: generate, copy, palette, improve, prompt
// Palette applies: bgColor → palette.bgColor, textColor → palette.textColor
```

---

## File: src/modules/vibe-dashboard/pages/vibe-dashboard-page.tsx

*[Full content — 220 lines — see repository: src/modules/vibe-dashboard/pages/vibe-dashboard-page.tsx]*

Dark dashboard with: sticky top nav (orange V logo + "VibeBuilder"), header with site count and "New Website" button, search input (filters `filteredSites` by `siteName`), 3-column grid of `WebsiteCard` components, shimmer skeleton loading (3 ghost cards), error state with Retry, empty state with illustration SVG.

---

## File: src/modules/vibe-dashboard/components/website-card.tsx

*[Full content — 325 lines — see repository: src/modules/vibe-dashboard/components/website-card.tsx]*

Per-site card with: accent-coloured header gradient, site initial badge, page count, Eye (preview site) and Trash (delete site) icons on hover. Per-page rows: page name, Live (green globe) / Draft (grey) badge, ExternalLink (view live), Pencil (edit), Copy (duplicate), Trash (delete) on hover. "Add Page" dashed button at bottom → AddPageModal with template picker.

---

## File: src/modules/renderer/pages/site-renderer-page.tsx

*[Full content — 279 lines — see repository: src/modules/renderer/pages/site-renderer-page.tsx]*

Public route at `/site/:userId/:slug`. Loads `getPublicPageLayout(userId, slug)` (filter: `{ userId, slug, isPublished: true }`). Renders all 9 component types sorted by `order`. Injects SEO meta tags, custom CSS/JS. Shows `SiteNav` when no Navbar block. Fade-in animation. Dark 404 with gradient text. Shimmer skeleton on load. "Built with VibeBuilder" credit bar at bottom.

---

## File: src/components/vibe/hero-section.tsx

```typescript
import { HeroSectionProps } from '@/types/vibebuilder';

export function HeroSection({
  heading,
  subtext,
  bgColor,
  imageUrl,
  ctaText,
  alignment = 'left',
  overlayOpacity = 0.3,
  gradientFrom,
  gradientTo,
}: HeroSectionProps) {
  const alignClass =
    alignment === 'center' ? 'items-center text-center' :
    alignment === 'right'  ? 'items-end text-right'    : 'items-start text-left';

  const bgStyle: React.CSSProperties = gradientFrom && gradientTo
    ? { background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }
    : { backgroundColor: bgColor };

  return (
    <section className="relative w-full min-h-[500px] flex items-center overflow-hidden" style={bgStyle}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: overlayOpacity }}
          aria-hidden
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
      <div className={`relative z-10 w-full max-w-5xl mx-auto px-8 py-20 flex flex-col gap-6 ${alignClass}`}>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-sm">
          {heading}
        </h1>
        {subtext && (
          <p className="text-lg md:text-2xl text-white/85 max-w-2xl font-light leading-relaxed">
            {subtext}
          </p>
        )}
        {ctaText && (
          <div className="mt-2">
            <button
              type="button"
              className="inline-flex items-center px-8 py-3.5 rounded-xl bg-white text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              style={{ color: gradientFrom ?? bgColor }}
            >
              {ctaText}
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
```
