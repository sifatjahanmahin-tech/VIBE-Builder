import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Pencil, Globe, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { Badge } from '@/components/ui-kit/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-kit/card';
import { useAuthStore } from '@/state/store/auth';
import { WebsiteProject, PageLayout } from '@/types/vibebuilder';
import { useSitePages, useCreatePage, useDeletePage, useDeleteWebsite } from '../hooks/use-websites';
import { AddPageModal } from './add-page-modal';

interface WebsiteCardProps {
  site: WebsiteProject;
}

function formatPageName(page: PageLayout): string {
  if (page.pageName && page.pageName !== page.slug) return page.pageName;
  return page.slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function WebsiteCard({ site }: WebsiteCardProps) {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.itemId ?? '');
  const [addPageOpen, setAddPageOpen] = useState(false);

  const { data: pages = [], isLoading: pagesLoading, isError: pagesError, refetch: refetchPages } = useSitePages(site.siteId);
  const createPageMut = useCreatePage(site.siteId);
  const deletePageMut = useDeletePage(site.siteId);
  const deleteWebsiteMut = useDeleteWebsite();

  function handleAddPage(pageName: string, slug: string) {
    createPageMut.mutate(
      { pageName, slug },
      { onSuccess: () => setAddPageOpen(false) }
    );
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
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold truncate">{site.siteName}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive shrink-0"
            onClick={handleDeleteSite}
            disabled={deleteWebsiteMut.isPending}
            title="Delete website"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 flex-1">
          {pagesLoading ? (
            <p className="text-sm text-muted-foreground">Loading pages…</p>
          ) : pagesError ? (
            <div className="flex items-center gap-2 text-destructive text-xs py-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1">Failed to load pages</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => refetchPages()}>
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          ) : pages.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No pages yet.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {pages.map((page) => (
                <li
                  key={page.pageId}
                  className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 hover:bg-muted/50 cursor-pointer group"
                  onClick={() => handleEditPage(page)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate">{formatPageName(page)}</span>
                    {page.isPublished && (
                      <Badge variant="secondary" className="text-xs gap-1 shrink-0">
                        <Globe className="h-3 w-3" />
                        Live
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {page.isPublished && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={(e) => handleViewLive(e, page)}
                        title="View live"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); handleEditPage(page); }}
                      title="Edit page"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100"
                      onClick={(e) => handleDeletePage(e, page.pageId)}
                      disabled={deletePageMut.isPending}
                      title="Delete page"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Button
            variant="outline"
            size="sm"
            className="mt-auto gap-1.5"
            onClick={() => setAddPageOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Page
          </Button>
        </CardContent>
      </Card>

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
