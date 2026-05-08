import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ComponentType, PageLayout, VibeComponent } from '@/types/vibebuilder';
import { getPublicPageLayout, getPublicSitePages } from '@/lib/blocks-api';
import { HeroSection } from '@/components/vibe/hero-section';
import { TextBlock } from '@/components/vibe/text-block';
import { ImageGallery } from '@/components/vibe/image-gallery';
import { ContactForm } from '@/components/vibe/contact-form';
import { Testimonial } from '@/components/vibe/testimonial';
import { FeaturesGrid } from '@/components/vibe/features-grid';
import { CTABanner } from '@/components/vibe/cta-banner';
import { Navbar } from '@/components/vibe/navbar';
import { Footer } from '@/components/vibe/footer';
import type {
  HeroSectionProps,
  TextBlockProps,
  ImageGalleryProps,
  ContactFormProps,
  TestimonialProps,
  FeaturesGridProps,
  CTABannerProps,
  NavbarProps,
  FooterProps,
} from '@/types/vibebuilder';

// ── localStorage helpers ─────────────────────────────────────────────────────

function lsGet<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; }
}

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
    case ComponentType.Testimonial:
      return <Testimonial key={c.id} {...(c.props as TestimonialProps)} />;
    case ComponentType.FeaturesGrid:
      return <FeaturesGrid key={c.id} {...(c.props as FeaturesGridProps)} />;
    case ComponentType.CTABanner:
      return <CTABanner key={c.id} {...(c.props as CTABannerProps)} />;
    case ComponentType.Navbar:
      return <Navbar key={c.id} {...(c.props as NavbarProps)} />;
    case ComponentType.Footer:
      return <Footer key={c.id} {...(c.props as FooterProps)} />;
    default:
      return null;
  }
}

// ---- Site nav (built-in multi-page nav, shown only when no Navbar block) ----

function SiteNav({
  siteName, pages, currentSlug, userId,
}: {
  siteName: string;
  pages: PageLayout[];
  currentSlug: string;
  userId: string;
}) {
  return (
    <nav className="w-full border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2 max-w-5xl mx-auto px-6 h-14">
        <span className="font-bold text-slate-800 mr-4 truncate">{siteName}</span>
        {pages.length > 1 && (
          <ul className="flex items-center gap-1 overflow-x-auto">
            {pages.map((p) => (
              <li key={p.pageId}>
                <Link
                  to={`/site/${userId}/${p.slug}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    p.slug === currentSlug
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p.pageName}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}

// ---- Loading skeleton ----

function PageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[480px] bg-slate-200" />
      <div className="max-w-4xl mx-auto px-8 py-12 flex flex-col gap-4">
        <div className="h-6 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-100 rounded w-full" />
        <div className="h-4 bg-slate-100 rounded w-5/6" />
        <div className="h-4 bg-slate-100 rounded w-2/3" />
      </div>
    </div>
  );
}

// ---- 404 ----

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 text-center px-4 bg-slate-50">
      <div className="text-8xl font-black text-slate-200 select-none">404</div>
      <div>
        <p className="text-2xl font-bold text-slate-700">Page not found</p>
        <p className="text-slate-400 mt-2 text-sm max-w-sm">
          This page doesn&apos;t exist or hasn&apos;t been published yet.
        </p>
      </div>
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
    if (!userId || !slug) { setStatus('not-found'); return; }
    setStatus('loading');
    getPublicPageLayout(userId, slug)
      .then((layout) => {
        if (!layout) { setStatus('not-found'); return; }
        setPage(layout);
        setStatus('found');
        getPublicSitePages(userId, layout.siteId).then(setNavPages).catch(() => { /* noop */ });
      })
      .catch(() => setStatus('not-found'));
  }, [userId, slug]);

  // SEO meta tags injection
  useEffect(() => {
    if (!page) return;
    const seo = lsGet<{ seoTitle?: string; seoDesc?: string; ogImage?: string }>(`vibe:seo:${page.pageId}`, {});

    document.title = seo.seoTitle || page.pageName || slug;

    const injected: HTMLElement[] = [];

    function setOrCreateMeta(selector: string, attr: string, attrVal: string, content: string) {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, attrVal);
        document.head.appendChild(el);
        injected.push(el);
      }
      el.setAttribute('content', content);
    }

    if (seo.seoDesc) {
      setOrCreateMeta('meta[name="description"]', 'name', 'description', seo.seoDesc);
      setOrCreateMeta('meta[property="og:description"]', 'property', 'og:description', seo.seoDesc);
    }
    if (seo.ogImage) {
      setOrCreateMeta('meta[property="og:image"]', 'property', 'og:image', seo.ogImage);
    }
    setOrCreateMeta('meta[property="og:title"]', 'property', 'og:title', document.title);

    return () => {
      document.title = 'VibeBuilder';
      injected.forEach((el) => el.remove());
    };
  }, [page, slug]);

  // Global font + custom CSS/JS injection
  useEffect(() => {
    if (!page) return;
    const design = lsGet<{ fontFamily?: string }>(`vibe:design:${page.siteId}`, {});
    const code = lsGet<{ customCSS?: string; customJS?: string }>(`vibe:code:${page.pageId}`, {});

    if (design.fontFamily) document.body.style.fontFamily = design.fontFamily;

    const injected: HTMLElement[] = [];

    if (code.customCSS) {
      const style = document.createElement('style');
      style.setAttribute('data-vibe-custom', '1');
      style.textContent = code.customCSS;
      document.head.appendChild(style);
      injected.push(style);
    }

    if (code.customJS) {
      const script = document.createElement('script');
      script.setAttribute('data-vibe-custom', '1');
      script.textContent = code.customJS;
      document.body.appendChild(script);
      injected.push(script);
    }

    return () => {
      document.body.style.fontFamily = '';
      injected.forEach((el) => el.remove());
    };
  }, [page]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-14 bg-white border-b" />
        <PageSkeleton />
      </div>
    );
  }

  if (status === 'not-found' || !page) return <NotFound />;

  const sortedComponents = [...page.components].sort((a, b) => a.order - b.order);
  const hasNavbarBlock = sortedComponents.some((c) => c.type === ComponentType.Navbar);

  return (
    <div className="min-h-screen bg-white scroll-smooth">
      {/* Only show built-in nav if the page has no Navbar component */}
      {!hasNavbarBlock && (
        <SiteNav siteName={page.pageName} pages={navPages} currentSlug={slug} userId={userId} />
      )}
      <main className="fade-in">
        {sortedComponents.map(renderComponent)}
      </main>
    </div>
  );
}
