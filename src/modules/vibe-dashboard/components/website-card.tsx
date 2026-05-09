import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Pencil, Globe, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/state/store/auth';
import { WebsiteProject, PageLayout } from '@/types/vibebuilder';
import { useSitePages, useCreatePage, useDeletePage, useDeleteWebsite } from '../hooks/use-websites';
import { AddPageModal } from './add-page-modal';

interface WebsiteCardProps {
  site: WebsiteProject;
}

const ACCENT_COLORS = [
  '#FF6B35', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444',
];

function getSiteAccent(name: string): string {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ACCENT_COLORS[hash % ACCENT_COLORS.length];
}

function formatPageName(page: PageLayout): string {
  if (page.pageName && page.pageName !== page.slug) return page.pageName;
  return page.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function WebsiteCard({ site }: WebsiteCardProps) {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.itemId ?? '');
  const [addPageOpen, setAddPageOpen] = useState(false);
  const accent = getSiteAccent(site.siteName);

  const {
    data: pages = [],
    isLoading: pagesLoading,
    isError: pagesError,
    error: pagesErrorObj,
    refetch: refetchPages,
  } = useSitePages(site.siteId);

  const createPageMut = useCreatePage(site.siteId);
  const deletePageMut = useDeletePage(site.siteId);
  const deleteWebsiteMut = useDeleteWebsite();

  function handleAddPage(pageName: string, slug: string) {
    createPageMut.mutate({ pageName, slug }, { onSuccess: () => setAddPageOpen(false) });
  }

  function handleDeletePage(e: React.MouseEvent, pageId: string) {
    e.stopPropagation();
    deletePageMut.mutate(pageId);
  }

  function handleDeleteSite(e: React.MouseEvent) {
    e.stopPropagation();
    if (window.confirm(`Delete "${site.siteName}" and all its pages?`)) {
      deleteWebsiteMut.mutate(site.siteId);
    }
  }

  function handleEditPage(page: PageLayout) {
    navigate(`/editor/${site.siteId}/${page.pageId}`);
  }

  function handleViewLive(e: React.MouseEvent, page: PageLayout) {
    e.stopPropagation();
    window.open(`/site/${userId}/${page.slug}`, '_blank');
  }

  return (
    <>
      <div
        className="rounded-xl overflow-hidden flex flex-col group transition-all duration-200 hover:-translate-y-0.5"
        style={{ backgroundColor: '#141414', border: '1px solid #2A2A2A', transition: 'border-color 0.2s, box-shadow 0.2s' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#FF6B3550';
          e.currentTarget.style.boxShadow = '0 0 0 1px #FF6B3520, 0 8px 32px rgba(255,107,53,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#2A2A2A';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Accent header strip */}
        <div
          className="px-5 py-5 flex items-end justify-between"
          style={{ background: `linear-gradient(135deg, ${accent}22, ${accent}08)`, borderBottom: '1px solid #2A2A2A' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
              style={{ backgroundColor: accent }}
            >
              {site.siteName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm leading-tight">{site.siteName}</h3>
              {!pagesLoading && !pagesError && (
                <span className="text-[10px]" style={{ color: '#666' }}>
                  {pages.length} page{pages.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="flex items-center justify-center w-7 h-7 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            style={{ color: '#555' }}
            onClick={handleDeleteSite}
            disabled={deleteWebsiteMut.isPending}
            title="Delete website"
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = '#ef444415'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Card body */}
        <div className="flex flex-col gap-2 p-4 flex-1">
          {/* Pages */}
          {pagesLoading ? (
            <p className="text-xs italic" style={{ color: '#555' }}>Loading pages…</p>
          ) : pagesError ? (
            <div className="flex items-center gap-2 text-xs py-1" style={{ color: '#ef4444' }}>
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1">{(pagesErrorObj as Error)?.message || 'Failed to load'}</span>
              <button
                type="button"
                className="w-5 h-5 flex items-center justify-center"
                onClick={() => refetchPages()}
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>
          ) : pages.length === 0 ? (
            <p className="text-xs italic" style={{ color: '#555' }}>No pages yet — add one below.</p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {pages.map((page) => (
                <li
                  key={page.pageId}
                  onClick={() => handleEditPage(page)}
                  className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 cursor-pointer group/page transition-colors"
                  style={{ border: '1px solid transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1E1E1E';
                    e.currentTarget.style.borderColor = '#2A2A2A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-white truncate">{formatPageName(page)}</span>
                    {page.isPublished ? (
                      <span
                        className="shrink-0 inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ color: '#10b981', backgroundColor: '#10b98115', border: '1px solid #10b98130' }}
                      >
                        <Globe className="h-2.5 w-2.5" />
                        Live
                      </span>
                    ) : (
                      <span
                        className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ color: '#666', backgroundColor: '#1E1E1E', border: '1px solid #333' }}
                      >
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover/page:opacity-100 transition-opacity">
                    {page.isPublished && (
                      <button
                        type="button"
                        className="w-6 h-6 flex items-center justify-center rounded transition-colors"
                        style={{ color: '#555' }}
                        onClick={(e) => handleViewLive(e, page)}
                        title="View live"
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#FF6B35'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; }}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="w-6 h-6 flex items-center justify-center rounded transition-colors"
                      style={{ color: '#555' }}
                      onClick={(e) => { e.stopPropagation(); handleEditPage(page); }}
                      title="Edit page"
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#FF6B35'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; }}
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      className="w-6 h-6 flex items-center justify-center rounded transition-colors"
                      style={{ color: '#555' }}
                      onClick={(e) => handleDeletePage(e, page.pageId)}
                      disabled={deletePageMut.isPending}
                      title="Delete page"
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Add page button */}
          <button
            type="button"
            className="mt-auto flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              color: '#666',
              border: '1px dashed #2A2A2A',
              backgroundColor: 'transparent',
            }}
            onClick={() => setAddPageOpen(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FF6B35';
              e.currentTarget.style.borderColor = '#FF6B35';
              e.currentTarget.style.backgroundColor = '#FF6B3508';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#666';
              e.currentTarget.style.borderColor = '#2A2A2A';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Page
          </button>
        </div>
      </div>

      <AddPageModal
        open={addPageOpen}
        onClose={() => { setAddPageOpen(false); createPageMut.reset(); }}
        onConfirm={handleAddPage}
        isLoading={createPageMut.isPending}
        error={createPageMut.error ? (createPageMut.error as Error).message : null}
      />
    </>
  );
}
