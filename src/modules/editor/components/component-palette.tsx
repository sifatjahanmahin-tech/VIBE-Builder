import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers, FileText, Settings2, Search,
  LayoutTemplate, Type, Images, Mail, Quote, Zap, Megaphone,
  Plus, Trash2, Loader2,
} from 'lucide-react';
import { ComponentType, COMPONENT_DEFINITIONS, PageLayout } from '@/types/vibebuilder';
import { getSitePages, createPage, deletePage as deletePageApi, renamePage } from '@/lib/blocks-api';
import { useAuthStore } from '@/state/store/auth';
import { AddPageModal } from '@/modules/vibe-dashboard/components/add-page-modal';

// ── Component icons ──────────────────────────────────────────────────────────

const COMP_ICONS: Record<ComponentType, React.ReactNode> = {
  [ComponentType.Hero]:         <LayoutTemplate className="h-5 w-5" />,
  [ComponentType.TextBlock]:    <Type className="h-5 w-5" />,
  [ComponentType.ImageGallery]: <Images className="h-5 w-5" />,
  [ComponentType.ContactForm]:  <Mail className="h-5 w-5" />,
  [ComponentType.Testimonial]:  <Quote className="h-5 w-5" />,
  [ComponentType.FeaturesGrid]: <Zap className="h-5 w-5" />,
  [ComponentType.CTABanner]:    <Megaphone className="h-5 w-5" />,
};

const CATEGORIES: { label: string; types: ComponentType[] }[] = [
  { label: 'LAYOUT',      types: [ComponentType.Hero, ComponentType.CTABanner] },
  { label: 'CONTENT',     types: [ComponentType.TextBlock, ComponentType.Testimonial, ComponentType.FeaturesGrid] },
  { label: 'MEDIA',       types: [ComponentType.ImageGallery] },
  { label: 'INTERACTIVE', types: [ComponentType.ContactForm] },
];

// ── Dark input style helper ──────────────────────────────────────────────────

const darkInput: React.CSSProperties = {
  width: '100%', backgroundColor: '#333', border: '1px solid #444',
  color: 'white', borderRadius: 6, padding: '7px 10px', fontSize: 12, outline: 'none',
};

type PanelTab = 'elements' | 'pages' | 'settings';

// ── Props ────────────────────────────────────────────────────────────────────

interface ComponentPaletteProps {
  onAdd: (type: ComponentType) => void;
  siteId: string;
  pageId: string;
  slug: string;
  pageName: string;
  onUpdateSlug: (slug: string) => Promise<void>;
  onDeletePage: () => Promise<void>;
}

// ── Component ────────────────────────────────────────────────────────────────

export function ComponentPalette({
  onAdd, siteId, pageId, slug, pageName, onUpdateSlug, onDeletePage,
}: ComponentPaletteProps) {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.itemId ?? '');

  const [activeTab, setActiveTab] = useState<PanelTab>('elements');
  const [query, setQuery] = useState('');

  // ── Pages tab state ────────────────────────────────────────────────────────
  const [pages, setPages] = useState<PageLayout[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [showAddPage, setShowAddPage] = useState(false);
  const [addPageLoading, setAddPageLoading] = useState(false);
  const [addPageError, setAddPageError] = useState<string | null>(null);

  // ── Settings tab state ────────────────────────────────────────────────────
  const [localSlug, setLocalSlug] = useState(slug);
  const [localSeoTitle, setLocalSeoTitle] = useState(pageName);
  const [savingSlug, setSavingSlug] = useState(false);
  const [savingSeoTitle, setSavingSeoTitle] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { setLocalSlug(slug); }, [slug]);
  useEffect(() => { setLocalSeoTitle(pageName); }, [pageName]);

  // Reload pages whenever the tab becomes active
  useEffect(() => {
    if (activeTab !== 'pages' || !siteId) return;
    setPagesLoading(true);
    getSitePages(siteId)
      .then(setPages)
      .catch(() => { /* ignore fetch errors */ })
      .finally(() => setPagesLoading(false));
  }, [activeTab, siteId]);

  // ── Pages handlers ────────────────────────────────────────────────────────

  async function handleAddPage(name: string, s: string) {
    setAddPageLoading(true);
    setAddPageError(null);
    try {
      const page = await createPage(siteId, userId, name, s);
      setPages((prev) => [...prev, page]);
      setShowAddPage(false);
    } catch (err) {
      setAddPageError((err as Error).message);
    } finally {
      setAddPageLoading(false);
    }
  }

  async function handleDeleteFromList(pid: string) {
    try {
      await deletePageApi(pid);
      setPages((prev) => prev.filter((p) => p.pageId !== pid));
      if (pid === pageId) navigate('/vibe-dashboard');
    } catch {
      // silent — page might already be deleted
    }
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
    if (!trimmed || trimmed === pageName) return;
    setSavingSeoTitle(true);
    try { await renamePage(pageId, trimmed); } catch { /* silent */ }
    finally { setSavingSeoTitle(false); }
  }

  async function handleDeletePage() {
    if (!window.confirm('Delete this page? This cannot be undone.')) return;
    setDeleting(true);
    try { await onDeletePage(); } catch { setDeleting(false); }
  }

  // ── Strip button config ───────────────────────────────────────────────────

  const STRIP_ICONS: { id: PanelTab; icon: React.ReactNode; label: string }[] = [
    { id: 'elements', icon: <Layers className="h-[18px] w-[18px]" />,   label: 'Elements' },
    { id: 'pages',    icon: <FileText className="h-[18px] w-[18px]" />, label: 'Pages' },
  ];

  const PANEL_LABEL: Record<PanelTab, string> = {
    elements: 'Elements', pages: 'Pages', settings: 'Settings',
  };

  function stripBtn(id: PanelTab, icon: React.ReactNode, title: string) {
    const active = activeTab === id;
    return (
      <button
        key={id}
        type="button"
        title={title}
        onClick={() => setActiveTab(id)}
        style={{
          width: 36, height: 36, borderRadius: 8, marginBottom: 4,
          backgroundColor: active ? '#FF6B35' : 'transparent',
          color: active ? 'white' : '#666',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#CCC'; }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#666'; }}
      >
        {icon}
      </button>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex shrink-0 h-full" style={{ borderRight: '1px solid #2A2A2A' }}>

      {/* ── Icon strip (48px) ── */}
      <div
        className="flex flex-col items-center pt-2 pb-2 shrink-0"
        style={{ width: 48, backgroundColor: '#1A1A1A', borderRight: '1px solid #2A2A2A' }}
      >
        {STRIP_ICONS.map(({ id, icon, label }) => stripBtn(id, icon, label))}

        {/* Settings pinned to bottom */}
        <div style={{ marginTop: 'auto' }}>
          {stripBtn('settings', <Settings2 className="h-[18px] w-[18px]" />, 'Settings')}
        </div>
      </div>

      {/* ── Panel (280px) ── */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ width: 280, backgroundColor: '#262626' }}
      >
        {/* Header */}
        <div style={{ padding: '12px 12px 0', borderBottom: '1px solid #333', flexShrink: 0 }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#888', marginBottom: 10,
          }}>
            {PANEL_LABEL[activeTab]}
          </p>

          {activeTab === 'elements' && (
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search style={{
                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                width: 13, height: 13, color: '#666', pointerEvents: 'none',
              }} />
              <input
                type="search"
                placeholder="Search elements"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: '100%', paddingLeft: 28, paddingRight: 8, paddingTop: 7, paddingBottom: 7,
                  backgroundColor: '#333', border: '1px solid #3A3A3A', borderRadius: 6,
                  color: 'white', fontSize: 12, outline: 'none',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#3A3A3A'; }}
              />
            </div>
          )}

          {activeTab === 'pages' && (
            <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowAddPage(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                  backgroundColor: '#FF6B35', color: 'white', border: 'none', cursor: 'pointer',
                }}
              >
                <Plus className="h-3 w-3" /> New Page
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: 12, scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}
        >

          {/* ── Elements ── */}
          {activeTab === 'elements' && (
            <>
              {CATEGORIES.map((cat) => {
                const defs = COMPONENT_DEFINITIONS.filter(
                  (d) => cat.types.includes(d.type) &&
                    (!query || d.label.toLowerCase().includes(query.toLowerCase()) ||
                     d.description.toLowerCase().includes(query.toLowerCase()))
                );
                if (!defs.length) return null;
                return (
                  <div key={cat.label} style={{ marginBottom: 16 }}>
                    <p style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: '#555', marginBottom: 8, padding: '0 2px',
                    }}>
                      {cat.label}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {defs.map((def) => (
                        <button
                          key={def.type}
                          type="button"
                          onClick={() => onAdd(def.type)}
                          title={def.description}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', gap: 6, padding: '10px 6px',
                            backgroundColor: '#333', border: '1px solid #3A3A3A',
                            borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                            minHeight: 76,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#3A3A3A';
                            e.currentTarget.style.borderColor = '#FF6B35';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#333';
                            e.currentTarget.style.borderColor = '#3A3A3A';
                          }}
                        >
                          <span style={{ color: '#CCC', display: 'flex' }}>
                            {COMP_ICONS[def.type]}
                          </span>
                          <span style={{
                            fontSize: 10, color: '#CCC', textAlign: 'center',
                            lineHeight: 1.3, fontWeight: 500,
                          }}>
                            {def.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {CATEGORIES.every((cat) =>
                !COMPONENT_DEFINITIONS.filter((d) => cat.types.includes(d.type) &&
                  (!query || d.label.toLowerCase().includes(query.toLowerCase()))).length
              ) && (
                <p style={{ fontSize: 12, color: '#555', textAlign: 'center', paddingTop: 32 }}>
                  No elements match your search.
                </p>
              )}
            </>
          )}

          {/* ── Pages ── */}
          {activeTab === 'pages' && (
            <>
              {pagesLoading ? (
                <div className="flex justify-center pt-8">
                  <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#FF6B35' }} />
                </div>
              ) : pages.length === 0 ? (
                <p style={{ fontSize: 12, color: '#555', textAlign: 'center', paddingTop: 32 }}>
                  No pages yet. Use &ldquo;New Page&rdquo; above to add one.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {pages.map((page) => {
                    const isCurrent = page.pageId === pageId;
                    return (
                      <div
                        key={page.pageId}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 10px', borderRadius: 8,
                          backgroundColor: isCurrent ? '#3A3A3A' : 'transparent',
                          border: `1px solid ${isCurrent ? '#FF6B35' : 'transparent'}`,
                          cursor: isCurrent ? 'default' : 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrent) {
                            e.currentTarget.style.backgroundColor = '#333';
                            e.currentTarget.style.borderColor = '#444';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrent) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = 'transparent';
                          }
                        }}
                        onClick={() => {
                          if (!isCurrent) navigate(`/editor/${siteId}/${page.pageId}`);
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 12, fontWeight: 600,
                            color: isCurrent ? 'white' : '#CCC',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {page.pageName}
                          </p>
                        </div>

                        {/* Live / Draft badge */}
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10,
                          backgroundColor: page.isPublished ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                          color: page.isPublished ? '#10b981' : '#666',
                          border: `1px solid ${page.isPublished ? 'rgba(16,185,129,0.3)' : '#333'}`,
                          flexShrink: 0,
                        }}>
                          {page.isPublished ? 'Live' : 'Draft'}
                        </span>

                        {/* Delete page */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); void handleDeleteFromList(page.pageId); }}
                          title="Delete page"
                          style={{
                            flexShrink: 0, padding: '3px 4px', borderRadius: 4,
                            backgroundColor: 'transparent', border: 'none',
                            color: '#555', cursor: 'pointer', transition: 'color 0.15s',
                            display: 'flex', alignItems: 'center',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
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
                <label style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: '#666',
                }}>
                  URL Slug
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={localSlug}
                    onChange={(e) => setLocalSlug(e.target.value)}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#444'; void commitSlug(); }}
                    style={{ ...darkInput, fontFamily: 'monospace', fontSize: 11 }}
                  />
                  {savingSlug && (
                    <Loader2
                      className="h-3 w-3 animate-spin"
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#888' }}
                    />
                  )}
                </div>
                <p style={{ fontSize: 10, color: '#555' }}>/site/…/{localSlug || 'slug'}</p>
              </div>

              {/* SEO Title */}
              <div className="flex flex-col gap-1.5">
                <label style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: '#666',
                }}>
                  SEO Title
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={localSeoTitle}
                    onChange={(e) => setLocalSeoTitle(e.target.value)}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#444'; void commitSeoTitle(); }}
                    placeholder="Page title for search engines"
                    style={darkInput}
                  />
                  {savingSeoTitle && (
                    <Loader2
                      className="h-3 w-3 animate-spin"
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#888' }}
                    />
                  )}
                </div>
                <p style={{ fontSize: 10, color: '#555' }}>Shown in browser tab and search results</p>
              </div>

              {/* Danger Zone */}
              <div style={{
                borderRadius: 8, border: '1px solid #3A1A1A',
                backgroundColor: '#180A0A', padding: 12,
              }}>
                <p style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: '#ef4444', marginBottom: 8,
                }}>
                  Danger Zone
                </p>
                <p style={{ fontSize: 11, color: '#777', marginBottom: 10, lineHeight: 1.5 }}>
                  Permanently delete this page and all its blocks. This cannot be undone.
                </p>
                <button
                  type="button"
                  onClick={() => void handleDeletePage()}
                  disabled={deleting}
                  style={{
                    width: '100%', padding: '7px 12px', borderRadius: 6,
                    backgroundColor: 'transparent', border: '1px solid #ef4444',
                    color: '#ef4444', fontSize: 12, fontWeight: 600,
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    opacity: deleting ? 0.6 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {deleting
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting…</>
                    : <><Trash2 className="h-3.5 w-3.5" /> Delete This Page</>
                  }
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Add Page Modal */}
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
