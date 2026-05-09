import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ComponentType, PageLayout, VibeComponent, WebsiteProject } from '@/types/vibebuilder';
import { getPublicPageLayout, getPublicSitePages, getPublicWebsiteProject } from '@/lib/blocks-api';
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

// ---- Site nav (shown only when no Navbar block) ----

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
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div
        style={{
          fontSize: 120, fontWeight: 900, lineHeight: 1,
          background: 'linear-gradient(135deg, #FF6B35, #ff9a6c)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          userSelect: 'none',
        }}
      >
        404
      </div>
      <div>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>Page not found</p>
        <p style={{ fontSize: 14, color: '#555', marginTop: 8, maxWidth: 320, lineHeight: 1.6 }}>
          This page doesn&apos;t exist or hasn&apos;t been published yet.
        </p>
      </div>
      <button
        type="button"
        onClick={() => window.history.back()}
        style={{
          padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          backgroundColor: '#FF6B35', color: 'white', border: 'none', cursor: 'pointer',
        }}
      >
        Go back
      </button>
    </div>
  );
}

// ---- Main renderer ----

export function SiteRendererPage() {
  const { userId = '', slug = '' } = useParams<{ userId: string; slug: string }>();

  const [page, setPage] = useState<PageLayout | null>(null);
  const [siteDesign, setSiteDesign] = useState<WebsiteProject | null>(null);
  const [navPages, setNavPages] = useState<PageLayout[]>([]);
  const [status, setStatus] = useState<'loading' | 'found' | 'not-found'>('loading');

  useEffect(() => {
    if (!userId || !slug) { setStatus('not-found'); return; }
    setStatus('loading');
    getPublicPageLayout(userId, slug)
      .then(async (layout) => {
        if (!layout) { setStatus('not-found'); return; }
        setPage(layout);
        setStatus('found');

        // Load site design + other pages in parallel (non-critical)
        await Promise.allSettled([
          getPublicWebsiteProject(layout.siteId).then((d) => { if (d) setSiteDesign(d); }),
          getPublicSitePages(userId, layout.siteId).then(setNavPages),
        ]);
      })
      .catch(() => setStatus('not-found'));
  }, [userId, slug]);

  // SEO meta tags — sourced from page fields (stored in Selise)
  useEffect(() => {
    if (!page) return;

    document.title = page.seoTitle || page.pageName || slug;

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

    if (page.seoDescription) {
      setOrCreateMeta('meta[name="description"]', 'name', 'description', page.seoDescription);
      setOrCreateMeta('meta[property="og:description"]', 'property', 'og:description', page.seoDescription);
    }
    if (page.ogImage) {
      setOrCreateMeta('meta[property="og:image"]', 'property', 'og:image', page.ogImage);
    }
    setOrCreateMeta('meta[property="og:title"]', 'property', 'og:title', document.title);

    return () => {
      document.title = 'VibeBuilder';
      injected.forEach((el) => el.remove());
    };
  }, [page, slug]);

  // Font, custom CSS/JS — sourced from Selise (site design + page fields)
  useEffect(() => {
    if (!page) return;

    const fontFamily = siteDesign?.fontFamily;
    if (fontFamily) document.body.style.fontFamily = fontFamily;

    const injected: HTMLElement[] = [];

    if (page.customCss) {
      const style = document.createElement('style');
      style.setAttribute('data-vibe-custom', '1');
      style.textContent = page.customCss;
      document.head.appendChild(style);
      injected.push(style);
    }

    if (page.customJs) {
      const script = document.createElement('script');
      script.setAttribute('data-vibe-custom', '1');
      script.textContent = page.customJs;
      document.body.appendChild(script);
      injected.push(script);
    }

    return () => {
      document.body.style.fontFamily = '';
      injected.forEach((el) => el.remove());
    };
  }, [page, siteDesign]);

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
    <div className="min-h-screen bg-white" style={{ scrollBehavior: 'smooth' }}>
      <style>{`
        @keyframes vibe-fadein {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .vibe-page-fadein { animation: vibe-fadein 0.4s ease both; }
      `}</style>
      {!hasNavbarBlock && (
        <SiteNav siteName={page.pageName} pages={navPages} currentSlug={slug} userId={userId} />
      )}
      <main className="vibe-page-fadein">
        {sortedComponents.map(renderComponent)}
      </main>
      {/* Built-with credit */}
      <div style={{
        textAlign: 'center', padding: '12px 16px',
        borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb',
        fontSize: 12, color: '#9ca3af',
      }}>
        Built with{' '}
        <a
          href="/"
          style={{ color: '#FF6B35', fontWeight: 600, textDecoration: 'none' }}
          target="_blank"
          rel="noopener noreferrer"
        >
          VibeBuilder
        </a>
      </div>
    </div>
  );
}
