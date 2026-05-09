import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers, FileText, Settings2, Search,
  LayoutTemplate, Type, Images, Mail, Quote, Zap, Megaphone,
  Navigation, AlignJustify,
  Plus, Trash2, Loader2, Star, Copy,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ComponentType, COMPONENT_DEFINITIONS, PageLayout } from '@/types/vibebuilder';
import { getSitePages, createPage, deletePage as deletePageApi, renamePage, getPageLayout, savePageLayout } from '@/lib/blocks-api';
import { useAuthStore } from '@/state/store/auth';
import { AddPageModal } from '@/modules/vibe-dashboard/components/add-page-modal';
import { buildTemplateComponents, PageTemplate } from '@/lib/page-templates';

// ── Component icons ──────────────────────────────────────────────────────────

const COMP_ICONS: Record<ComponentType, React.ReactNode> = {
  [ComponentType.Hero]:         <LayoutTemplate className="h-5 w-5" />,
  [ComponentType.TextBlock]:    <Type className="h-5 w-5" />,
  [ComponentType.ImageGallery]: <Images className="h-5 w-5" />,
  [ComponentType.ContactForm]:  <Mail className="h-5 w-5" />,
  [ComponentType.Testimonial]:  <Quote className="h-5 w-5" />,
  [ComponentType.FeaturesGrid]: <Zap className="h-5 w-5" />,
  [ComponentType.CTABanner]:    <Megaphone className="h-5 w-5" />,
  [ComponentType.Navbar]:       <Navigation className="h-5 w-5" />,
  [ComponentType.Footer]:       <AlignJustify className="h-5 w-5" />,
};

const CATEGORIES: { label: string; types: ComponentType[] }[] = [
  { label: 'LAYOUT',      types: [ComponentType.Navbar, ComponentType.Hero, ComponentType.CTABanner, ComponentType.Footer] },
  { label: 'CONTENT',     types: [ComponentType.TextBlock, ComponentType.Testimonial, ComponentType.FeaturesGrid] },
  { label: 'MEDIA',       types: [ComponentType.ImageGallery] },
  { label: 'INTERACTIVE', types: [ComponentType.ContactForm] },
];

const QUICK_THEMES = [
  { name: 'Dark',   primaryColor: '#FF6B35', secondaryColor: '#1A1A2E', fontFamily: 'system-ui, sans-serif' },
  { name: 'Light',  primaryColor: '#6366f1', secondaryColor: '#f1f5f9', fontFamily: 'system-ui, sans-serif' },
  { name: 'Ocean',  primaryColor: '#06b6d4', secondaryColor: '#0c4a6e', fontFamily: 'system-ui, sans-serif' },
  { name: 'Forest', primaryColor: '#10b981', secondaryColor: '#064e3b', fontFamily: 'Georgia, serif' },
  { name: 'Sunset', primaryColor: '#f59e0b', secondaryColor: '#7c2d12', fontFamily: 'system-ui, sans-serif' },
  { name: 'Purple', primaryColor: '#8b5cf6', secondaryColor: '#2e1065', fontFamily: 'system-ui, sans-serif' },
];

const darkInput: React.CSSProperties = {
  width: '100%', backgroundColor: '#1E1E1E', border: '1px solid #333',
  color: 'white', borderRadius: 6, padding: '7px 10px', fontSize: 12, outline: 'none',
};

const darkTextarea: React.CSSProperties = {
  ...darkInput, resize: 'vertical' as const, lineHeight: 1.5, fontFamily: 'monospace', fontSize: 11,
};

type PanelTab = 'elements' | 'pages' | 'settings';

// ── Props ────────────────────────────────────────────────────────────────────

interface ComponentPaletteProps {
  onAdd: (type: ComponentType) => void;
  siteId: string;
  pageId: string;
  slug: string;
  pageName: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  customCss: string;
  customJs: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  onUpdateSlug: (slug: string) => Promise<void>;
  onDeletePage: () => Promise<void>;
  onUpdatePageMeta: (meta: {
    seoTitle?: string; seoDescription?: string; ogImage?: string;
    customCss?: string; customJs?: string;
  }) => void;
  onUpdateSiteDesign: (design: {
    primaryColor?: string; secondaryColor?: string; fontFamily?: string;
  }) => Promise<void>;
}

// ── Component ────────────────────────────────────────────────────────────────

export function ComponentPalette({
  onAdd, siteId, pageId, slug, pageName,
  seoTitle, seoDescription, ogImage, customCss, customJs,
  primaryColor, secondaryColor, fontFamily,
  onUpdateSlug, onDeletePage, onUpdatePageMeta, onUpdateSiteDesign,
}: ComponentPaletteProps) {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.itemId ?? '');

  const [activeTab, setActiveTab] = useState<PanelTab>('elements');
  const [query, setQuery] = useState('');

  // ── Favorites + Recently Used ─────────────────────────────────────────────
  const [favorites, setFavorites] = useState<ComponentType[]>(() => {
    try { return JSON.parse(localStorage.getItem('vibe-favorites') ?? '[]') as ComponentType[]; }
    catch { return []; }
  });

  const [recentlyUsed, setRecentlyUsed] = useState<ComponentType[]>(() => {
    try { return JSON.parse(localStorage.getItem('vibe-recent') ?? '[]') as ComponentType[]; }
    catch { return []; }
  });

  function toggleFavorite(e: React.MouseEvent, type: ComponentType) {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type];
      localStorage.setItem('vibe-favorites', JSON.stringify(next));
      return next;
    });
  }

  function handleAdd(type: ComponentType) {
    setRecentlyUsed((prev) => {
      const next = [type, ...prev.filter((t) => t !== type)].slice(0, 4);
      localStorage.setItem('vibe-recent', JSON.stringify(next));
      return next;
    });
    onAdd(type);
  }

  // ── Pages tab ─────────────────────────────────────────────────────────────
  const [pages, setPages] = useState<PageLayout[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [showAddPage, setShowAddPage] = useState(false);
  const [addPageLoading, setAddPageLoading] = useState(false);
  const [addPageError, setAddPageError] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  // ── Settings: local copies for controlled inputs ──────────────────────────
  const [localSlug, setLocalSlug] = useState(slug);
  const [localSeoTitle, setLocalSeoTitle] = useState(seoTitle || pageName);
  const [savingSlug, setSavingSlug] = useState(false);
  const [savingSeoTitle, setSavingSeoTitle] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { setLocalSlug(slug); }, [slug]);
  useEffect(() => { setLocalSeoTitle(seoTitle || pageName); }, [seoTitle, pageName]);

  useEffect(() => {
    if (activeTab !== 'pages' || !siteId) return;
    setPagesLoading(true);
    getSitePages(siteId)
      .then(setPages)
      .catch(() => { /* ignore */ })
      .finally(() => setPagesLoading(false));
  }, [activeTab, siteId]);

  // ── Pages handlers ────────────────────────────────────────────────────────

  async function handleAddPage(name: string, s: string, template?: PageTemplate) {
    setAddPageLoading(true);
    setAddPageError(null);
    try {
      const page = await createPage(siteId, userId, name, s);
      if (template) {
        const components = buildTemplateComponents(template);
        await savePageLayout(page.pageId, components);
      }
      setPages((prev) => [...prev, page]);
      setShowAddPage(false);
    } catch (err) {
      setAddPageError((err as Error).message);
    } finally {
      setAddPageLoading(false);
    }
  }

  async function handleDuplicatePage(pid: string, pName: string, pSlug: string) {
    setDuplicatingId(pid);
    try {
      const source = await getPageLayout(pid);
      const newPage = await createPage(siteId, userId, `${pName} (Copy)`, `${pSlug}-copy`);
      if (source?.components.length) {
        const newComponents = source.components.map((c) => ({ ...c, id: uuidv4() }));
        await savePageLayout(newPage.pageId, newComponents);
      }
      setPages((prev) => [...prev, newPage]);
    } catch { /* silent */ }
    finally { setDuplicatingId(null); }
  }

  async function handleDeleteFromList(pid: string) {
    try {
      await deletePageApi(pid);
      setPages((prev) => prev.filter((p) => p.pageId !== pid));
      if (pid === pageId) navigate('/vibe-dashboard');
    } catch { /* silent */ }
  }

  // ── Settings handlers ─────────────────────────────────────────────────────

  async function commitSlug() {
    const trimmed = localSlug.trim();
    if (!trimmed || trimmed === slug) return;
    setSavingSlug(true);
    try { await onUpdateSlug(trimmed); } catch { /* handled by caller */ }
    finally { setSavingSlug(false); }
  }

  async function commitSeoTitle() {
    const trimmed = localSeoTitle.trim();
    if (!trimmed || trimmed === (seoTitle || pageName)) return;
    setSavingSeoTitle(true);
    try {
      await renamePage(pageId, trimmed);
      onUpdatePageMeta({ seoTitle: trimmed });
    } catch { /* silent */ }
    finally { setSavingSeoTitle(false); }
  }

  async function handleDeletePage() {
    if (!window.confirm('Delete this page? This cannot be undone.')) return;
    setDeleting(true);
    try { await onDeletePage(); } catch { setDeleting(false); }
  }

  // ── Shared helpers ────────────────────────────────────────────────────────

  const PANEL_LABEL: Record<PanelTab, string> = {
    elements: 'Elements', pages: 'Pages', settings: 'Settings',
  };

  function stripBtn(id: PanelTab, icon: React.ReactNode, title: string) {
    const active = activeTab === id;
    return (
      <button
        key={id} type="button" title={title} onClick={() => setActiveTab(id)}
        style={{
          width: 36, height: 36, borderRadius: 8, marginBottom: 4,
          backgroundColor: active ? '#FF6B35' : 'transparent',
          color: active ? 'white' : '#666',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#CCC'; }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#666'; }}
      >
        {icon}
      </button>
    );
  }

  function SettingLabel({ children }: { children: React.ReactNode }) {
    return (
      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 5 }}>
        {children}
      </label>
    );
  }

  function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FF6B35', marginBottom: 10 }}>
        {children}
      </p>
    );
  }

  function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
      <div style={{ marginBottom: 10 }}>
        <SettingLabel>{label}</SettingLabel>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)}
            style={{ width: 32, height: 32, padding: 2, cursor: 'pointer', backgroundColor: '#333', border: '1px solid #444', borderRadius: 6, flexShrink: 0 }}
          />
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
            style={{ ...darkInput, fontFamily: 'monospace', fontSize: 11 }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#333'; }}
          />
        </div>
      </div>
    );
  }

  // ── Component tile renderer ───────────────────────────────────────────────

  function ComponentTile({ def, showStar = true }: { def: typeof COMPONENT_DEFINITIONS[0]; showStar?: boolean }) {
    const isFav = favorites.includes(def.type);
    return (
      <div style={{ position: 'relative' }} className="group/tile">
        <button type="button" onClick={() => handleAdd(def.type)} title={def.description}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 6px', backgroundColor: '#333', border: '1px solid #3A3A3A', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', minHeight: 76, width: '100%' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3A3A3A'; e.currentTarget.style.borderColor = '#FF6B35'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#333'; e.currentTarget.style.borderColor = '#3A3A3A'; }}
        >
          <span style={{ color: '#CCC', display: 'flex' }}>{COMP_ICONS[def.type]}</span>
          <span style={{ fontSize: 10, color: '#CCC', textAlign: 'center', lineHeight: 1.3, fontWeight: 500 }}>{def.label}</span>
        </button>
        {showStar && (
          <button
            type="button"
            onClick={(e) => toggleFavorite(e, def.type)}
            className="opacity-0 group-hover/tile:opacity-100 transition-opacity"
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            style={{
              position: 'absolute', top: 4, right: 4, width: 16, height: 16,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              color: isFav ? '#FF6B35' : '#555', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Star style={{ width: 10, height: 10, fill: isFav ? '#FF6B35' : 'none' }} />
          </button>
        )}
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex shrink-0 h-full" style={{ borderRight: '1px solid #2A2A2A' }}>

      {/* Icon strip */}
      <div className="flex flex-col items-center pt-2 pb-2 shrink-0"
        style={{ width: 48, backgroundColor: '#1A1A1A', borderRight: '1px solid #2A2A2A' }}>
        {stripBtn('elements', <Layers className="h-[18px] w-[18px]" />, 'Elements')}
        {stripBtn('pages',    <FileText className="h-[18px] w-[18px]" />, 'Pages')}
        <div style={{ marginTop: 'auto' }}>
          {stripBtn('settings', <Settings2 className="h-[18px] w-[18px]" />, 'Settings')}
        </div>
      </div>

      {/* Panel */}
      <div className="flex flex-col overflow-hidden" style={{ width: 280, backgroundColor: '#262626' }}>

        {/* Header */}
        <div style={{ padding: '12px 12px 0', borderBottom: '1px solid #333', flexShrink: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: 10 }}>
            {PANEL_LABEL[activeTab]}
          </p>

          {activeTab === 'elements' && (
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#666', pointerEvents: 'none' }} />
              <input type="search" placeholder="Search elements" value={query} onChange={(e) => setQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: 28, paddingRight: 8, paddingTop: 7, paddingBottom: 7, backgroundColor: '#333', border: '1px solid #3A3A3A', borderRadius: 6, color: 'white', fontSize: 12, outline: 'none' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#3A3A3A'; }}
              />
            </div>
          )}

          {activeTab === 'pages' && (
            <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowAddPage(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, backgroundColor: '#FF6B35', color: 'white', border: 'none', cursor: 'pointer' }}>
                <Plus className="h-3 w-3" /> New Page
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: 12, scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>

          {/* ── Elements ── */}
          {activeTab === 'elements' && (
            <>
              {/* Recently Used */}
              {!query && recentlyUsed.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 8, padding: '0 2px' }}>
                    RECENTLY USED
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {recentlyUsed
                      .map((type) => COMPONENT_DEFINITIONS.find((d) => d.type === type))
                      .filter((def): def is typeof COMPONENT_DEFINITIONS[0] => def !== undefined)
                      .map((def) => <ComponentTile key={`recent-${def.type}`} def={def} />)}
                  </div>
                </div>
              )}

              {/* Favorites */}
              {!query && favorites.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 8, padding: '0 2px' }}>
                    ★ FAVORITES
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {favorites
                      .map((type) => COMPONENT_DEFINITIONS.find((d) => d.type === type))
                      .filter((def): def is typeof COMPONENT_DEFINITIONS[0] => def !== undefined)
                      .map((def) => <ComponentTile key={`fav-${def.type}`} def={def} />)}
                  </div>
                </div>
              )}

              {/* Categories */}
              {CATEGORIES.map((cat) => {
                const defs = COMPONENT_DEFINITIONS.filter(
                  (d) => cat.types.includes(d.type) &&
                    (!query || d.label.toLowerCase().includes(query.toLowerCase()) || d.description.toLowerCase().includes(query.toLowerCase()))
                );
                if (!defs.length) return null;
                return (
                  <div key={cat.label} style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 8, padding: '0 2px' }}>
                      {cat.label}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {defs.map((def) => <ComponentTile key={def.type} def={def} />)}
                    </div>
                  </div>
                );
              })}

              {CATEGORIES.every((cat) => !COMPONENT_DEFINITIONS.filter((d) => cat.types.includes(d.type) && (!query || d.label.toLowerCase().includes(query.toLowerCase()))).length) && (
                <p style={{ fontSize: 12, color: '#555', textAlign: 'center', paddingTop: 32 }}>No elements match your search.</p>
              )}
            </>
          )}

          {/* ── Pages ── */}
          {activeTab === 'pages' && (
            <>
              {pagesLoading ? (
                <div className="flex justify-center pt-8"><Loader2 className="h-5 w-5 animate-spin" style={{ color: '#FF6B35' }} /></div>
              ) : pages.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: 40 }}>
                  <FileText style={{ width: 32, height: 32, color: '#333', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 12, color: '#555' }}>No pages yet.</p>
                  <button type="button" onClick={() => setShowAddPage(true)}
                    style={{ marginTop: 12, fontSize: 12, color: '#FF6B35', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    + Create your first page
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {pages.map((page) => {
                    const isCurrent = page.pageId === pageId;
                    const isDuplicating = duplicatingId === page.pageId;
                    return (
                      <div key={page.pageId}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, backgroundColor: isCurrent ? '#3A3A3A' : 'transparent', border: `1px solid ${isCurrent ? '#FF6B35' : 'transparent'}`, cursor: isCurrent ? 'default' : 'pointer', transition: 'all 0.15s' }}
                        className="group/pagerow"
                        onMouseEnter={(e) => { if (!isCurrent) { e.currentTarget.style.backgroundColor = '#333'; e.currentTarget.style.borderColor = '#444'; } }}
                        onMouseLeave={(e) => { if (!isCurrent) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}
                        onClick={() => { if (!isCurrent) navigate(`/editor/${siteId}/${page.pageId}`); }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: isCurrent ? 'white' : '#CCC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {page.pageName}
                          </p>
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10, backgroundColor: page.isPublished ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)', color: page.isPublished ? '#10b981' : '#666', border: `1px solid ${page.isPublished ? 'rgba(16,185,129,0.3)' : '#333'}`, flexShrink: 0 }}>
                          {page.isPublished ? 'Live' : 'Draft'}
                        </span>
                        <div className="opacity-0 group-hover/pagerow:opacity-100 transition-opacity" style={{ display: 'flex', gap: 2 }}>
                          <button type="button" onClick={(e) => { e.stopPropagation(); void handleDuplicatePage(page.pageId, page.pageName, page.slug); }} title="Duplicate page"
                            disabled={isDuplicating}
                            style={{ flexShrink: 0, padding: '3px 4px', borderRadius: 4, backgroundColor: 'transparent', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#6366f1'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; }}
                          >
                            {isDuplicating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Copy className="h-3 w-3" />}
                          </button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); void handleDeleteFromList(page.pageId); }} title="Delete page"
                            style={{ flexShrink: 0, padding: '3px 4px', borderRadius: 4, backgroundColor: 'transparent', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── Settings ── */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-5">

              {/* URL Slug */}
              <div className="flex flex-col gap-1.5">
                <SettingLabel>URL Slug</SettingLabel>
                <div style={{ position: 'relative' }}>
                  <input type="text" value={localSlug} onChange={(e) => setLocalSlug(e.target.value)}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#333'; void commitSlug(); }}
                    style={{ ...darkInput, fontFamily: 'monospace', fontSize: 11 }}
                  />
                  {savingSlug && <Loader2 className="h-3 w-3 animate-spin" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />}
                </div>
                <p style={{ fontSize: 10, color: '#555' }}>/site/…/{localSlug || 'slug'}</p>
              </div>

              {/* SEO */}
              <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
                <SectionHeading>SEO</SectionHeading>

                <div style={{ marginBottom: 10 }}>
                  <SettingLabel>Page Title</SettingLabel>
                  <div style={{ position: 'relative' }}>
                    <input type="text" value={localSeoTitle} onChange={(e) => setLocalSeoTitle(e.target.value)}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#333'; void commitSeoTitle(); }}
                      placeholder="Page title for search engines" style={darkInput}
                    />
                    {savingSeoTitle && <Loader2 className="h-3 w-3 animate-spin" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />}
                  </div>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <SettingLabel>Meta Description</SettingLabel>
                  <textarea value={seoDescription} rows={3} placeholder="Describe this page for search engines…"
                    onChange={(e) => onUpdatePageMeta({ seoDescription: e.target.value })}
                    style={darkTextarea}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#333'; }}
                  />
                </div>

                <div>
                  <SettingLabel>OG Image URL</SettingLabel>
                  <input type="text" value={ogImage} placeholder="https://…/og-image.jpg"
                    onChange={(e) => onUpdatePageMeta({ ogImage: e.target.value })}
                    style={darkInput}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#333'; }}
                  />
                </div>
              </div>

              {/* Quick Themes */}
              <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
                <SectionHeading>Quick Themes</SectionHeading>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
                  {QUICK_THEMES.map((theme) => (
                    <button
                      key={theme.name}
                      type="button"
                      title={`Apply ${theme.name} theme`}
                      onClick={() => void onUpdateSiteDesign({ primaryColor: theme.primaryColor, secondaryColor: theme.secondaryColor, fontFamily: theme.fontFamily })}
                      style={{
                        padding: '8px 6px', borderRadius: 7, border: '1px solid #333',
                        backgroundColor: theme.secondaryColor, cursor: 'pointer', transition: 'all 0.15s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.primaryColor; e.currentTarget.style.transform = 'scale(1.03)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: theme.primaryColor }} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#CCC' }}>{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Global Design */}
              <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
                <SectionHeading>Global Design</SectionHeading>
                <ColorRow label="Primary Color" value={primaryColor}
                  onChange={(v) => void onUpdateSiteDesign({ primaryColor: v })} />
                <ColorRow label="Secondary Color" value={secondaryColor}
                  onChange={(v) => void onUpdateSiteDesign({ secondaryColor: v })} />
                <div>
                  <SettingLabel>Font Family</SettingLabel>
                  <select value={fontFamily} onChange={(e) => void onUpdateSiteDesign({ fontFamily: e.target.value })}
                    style={{ ...darkInput, cursor: 'pointer' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#333'; }}
                  >
                    {[
                      { value: 'system-ui, sans-serif',   label: 'System UI' },
                      { value: 'sans-serif',               label: 'System Sans' },
                      { value: 'Georgia, serif',           label: 'Georgia' },
                      { value: "'Courier New', monospace", label: 'Monospace' },
                      { value: "'Arial', sans-serif",      label: 'Arial' },
                    ].map((o) => (
                      <option key={o.value} value={o.value} style={{ backgroundColor: '#222' }}>{o.label}</option>
                    ))}
                  </select>
                  <p style={{ fontSize: 10, color: '#555', marginTop: 4 }}>For Google Fonts, use Custom CSS @import</p>
                </div>
              </div>

              {/* Custom Code */}
              <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
                <SectionHeading>Custom Code</SectionHeading>
                <div style={{ marginBottom: 10 }}>
                  <SettingLabel>Custom CSS</SettingLabel>
                  <textarea value={customCss} rows={5} placeholder="/* injected into published page */"
                    onChange={(e) => onUpdatePageMeta({ customCss: e.target.value })}
                    style={darkTextarea}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#333'; }}
                  />
                </div>
                <div>
                  <SettingLabel>Custom JS</SettingLabel>
                  <textarea value={customJs} rows={5} placeholder="// runs at end of published page"
                    onChange={(e) => onUpdatePageMeta({ customJs: e.target.value })}
                    style={darkTextarea}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#333'; }}
                  />
                  <p style={{ fontSize: 10, color: '#555', marginTop: 4 }}>Changes saved with the page (Ctrl+S)</p>
                </div>
              </div>

              {/* Danger Zone */}
              <div style={{ borderRadius: 8, border: '1px solid #3A1A1A', backgroundColor: '#180A0A', padding: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ef4444', marginBottom: 8 }}>
                  Danger Zone
                </p>
                <p style={{ fontSize: 11, color: '#777', marginBottom: 10, lineHeight: 1.5 }}>
                  Permanently delete this page and all its blocks.
                </p>
                <button type="button" onClick={() => void handleDeletePage()} disabled={deleting}
                  style={{ width: '100%', padding: '7px 12px', borderRadius: 6, backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background-color 0.15s' }}
                  onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {deleting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting…</> : <><Trash2 className="h-3.5 w-3.5" /> Delete This Page</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddPageModal
        open={showAddPage}
        onClose={() => { setShowAddPage(false); setAddPageError(null); }}
        onConfirm={handleAddPage}
        isLoading={addPageLoading}
        error={addPageError}
      />
    </div>
  );
}
