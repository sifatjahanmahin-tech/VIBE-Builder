import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ComponentType, PageLayout, VibeComponent } from '@/types/vibebuilder';
import { getPublicPageLayout, getPublicSitePages } from '@/lib/blocks-api';
import { HeroSection } from '@/components/vibe/hero-section';
import { TextBlock } from '@/components/vibe/text-block';
import { ImageGallery } from '@/components/vibe/image-gallery';
import { ContactForm } from '@/components/vibe/contact-form';
import type {
  HeroSectionProps,
  TextBlockProps,
  ImageGalleryProps,
  ContactFormProps,
} from '@/types/vibebuilder';

// ---- Component renderer ----

function renderComponent(c: VibeComponent) {
  switch (c.type) {
    case ComponentType.Hero:
      return <HeroSection key={c.id} {...(c.props as HeroSectionProps)} />;
    case ComponentType.TextBlock:
      return <TextBlock key={c.id} {...(c.props as TextBlockProps)} />;
    case ComponentType.ImageGallery:
      return <ImageGallery key={c.id} {...(c.props as ImageGalleryProps)} />;
    case ComponentType.ContactForm:
      return <ContactForm key={c.id} {...(c.props as ContactFormProps)} />;
    default:
      return null;
  }
}

// ---- Site nav ----

function SiteNav({
  pages,
  currentSlug,
  userId,
}: {
  pages: PageLayout[];
  currentSlug: string;
  userId: string;
}) {
  if (pages.length <= 1) return null;
  return (
    <nav className="w-full border-b bg-white/90 backdrop-blur sticky top-0 z-50">
      <ul className="flex items-center gap-1 max-w-5xl mx-auto px-6 h-14">
        {pages.map((p) => (
          <li key={p.pageId}>
            <Link
              to={`/site/${userId}/${p.slug}`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                p.slug === currentSlug
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {p.pageName}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ---- 404 ----

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <p className="text-6xl font-black text-muted-foreground/30">404</p>
      <p className="text-xl font-semibold">Page not found</p>
      <p className="text-sm text-muted-foreground">
        This page doesn&apos;t exist or hasn&apos;t been published yet.
      </p>
    </div>
  );
}

// ---- Main renderer ----

export function SiteRendererPage() {
  const { userId = '', slug = '' } = useParams<{ userId: string; slug: string }>();

  const [page, setPage] = useState<PageLayout | null>(null);
  const [navPages, setNavPages] = useState<PageLayout[]>([]);
  const [status, setStatus] = useState<'loading' | 'found' | 'not-found'>('loading');

  useEffect(() => {
    if (!userId || !slug) {
      setStatus('not-found');
      return;
    }

    setStatus('loading');
    getPublicPageLayout(userId, slug)
      .then((layout) => {
        if (!layout) {
          setStatus('not-found');
          return;
        }
        setPage(layout);
        setStatus('found');
        // Load nav pages in background
        getPublicSitePages(userId, layout.siteId).then(setNavPages).catch(() => { /* noop */ });
      })
      .catch(() => setStatus('not-found'));
  }, [userId, slug]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'not-found' || !page) {
    return <NotFound />;
  }

  const sortedComponents = [...page.components].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav pages={navPages} currentSlug={slug} userId={userId} />
      <main>{sortedComponents.map(renderComponent)}</main>
    </div>
  );
}
