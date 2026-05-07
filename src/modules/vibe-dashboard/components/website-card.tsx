import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Pencil, Globe, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { useAuthStore } from '@/state/store/auth';
import { WebsiteProject, PageLayout } from '@/types/vibebuilder';
import { useSitePages, useCreatePage, useDeletePage, useDeleteWebsite } from '../hooks/use-websites';
import { AddPageModal } from './add-page-modal';

interface WebsiteCardProps {
  site: WebsiteProject;
}

const GRADIENTS = [
  'from-indigo-500 to-violet-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-600',
  'from-amber-500 to-orange-500',
  'from-teal-500 to-green-500',
  'from-violet-500 to-purple-600',
];

function getSiteGradient(name: string): string {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
}

function formatPageName(page: PageLayout): string {
  if (page.pageName && page.pageName !== page.slug) return page.pageName;
  return page.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function WebsiteCard({ site }: WebsiteCardProps) {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.itemId ?? '');
  const [addPageOpen, setAddPageOpen] = useState(false);
  const gradient = getSiteGradient(site.siteName);

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
      <div className="group rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">

        {/* Gradient thumbnail */}
        <div className={`bg-gradient-to-br ${gradient} px-5 py-6 flex items-end justify-between`}>
          <div className="flex flex-col gap-1">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-xl">
              {site.siteName.charAt(0).toUpperCase()}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
            onClick={handleDeleteSite}
            disabled={deleteWebsiteMut.isPending}
            title="Delete website"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Card body */}
        <div className="flex flex-col gap-3 p-4 flex-1">
          {/* Site name + page count */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-800 text-base leading-tight">{site.siteName}</h3>
            {!pagesLoading && !pagesError && (
              <span className="shrink-0 text-[11px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {pages.length} page{pages.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Pages */}
          {pagesLoading ? (
            <p className="text-xs text-slate-400 italic">Loading pages…</p>
          ) : pagesError ? (
            <div className="flex items-center gap-2 text-red-400 text-xs py-1">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1">{(pagesErrorObj as Error)?.message || 'Failed to load'}</span>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => refetchPages()}>
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          ) : pages.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No pages yet — add one below.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {pages.map((page) => (
                <li
                  key={page.pageId}
                  onClick={() => handleEditPage(page)}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-slate-50 cursor-pointer group/page transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-medium text-slate-700 truncate">{formatPageName(page)}</span>
                    {page.isPublished && (
                      <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                        <Globe className="h-2.5 w-2.5" />
                        Live
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover/page:opacity-100 transition-opacity">
                    {page.isPublished && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-indigo-600"
                        onClick={(e) => handleViewLive(e, page)}
                        title="View live"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-slate-400 hover:text-indigo-600"
                      onClick={(e) => { e.stopPropagation(); handleEditPage(page); }}
                      title="Edit page"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-slate-400 hover:text-red-500"
                      onClick={(e) => handleDeletePage(e, page.pageId)}
                      disabled={deletePageMut.isPending}
                      title="Delete page"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Add page button */}
          <Button
            variant="outline"
            size="sm"
            className="mt-auto gap-1.5 text-xs border-dashed hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            onClick={() => setAddPageOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Page
          </Button>
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
