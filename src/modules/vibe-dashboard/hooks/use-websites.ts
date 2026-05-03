import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/state/store/auth';
import {
  createPage,
  createWebsite,
  deletePage,
  deleteWebsite,
  getSitePages,
  getMyWebsites,
} from '@/lib/blocks-api';

export const WEBSITES_KEY = 'vibe-websites';
export const PAGES_KEY = 'vibe-pages';

export function useMyWebsites() {
  const userId = useAuthStore((s) => s.user?.itemId ?? '');
  return useQuery({
    queryKey: [WEBSITES_KEY, userId],
    queryFn: () => getMyWebsites(userId),
    enabled: !!userId,
  });
}

export function useSitePages(siteId: string) {
  return useQuery({
    queryKey: [PAGES_KEY, siteId],
    queryFn: () => getSitePages(siteId),
    enabled: !!siteId,
  });
}

export function useCreateWebsite() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.itemId ?? '');
  return useMutation({
    mutationFn: (siteName: string) => createWebsite(siteName, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WEBSITES_KEY, userId] }),
  });
}

export function useDeleteWebsite() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.itemId ?? '');
  return useMutation({
    mutationFn: (siteId: string) => deleteWebsite(siteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WEBSITES_KEY, userId] }),
  });
}

export function useCreatePage(siteId: string) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.itemId ?? '');
  return useMutation({
    mutationFn: ({ pageName, slug }: { pageName: string; slug: string }) =>
      createPage(siteId, userId, pageName, slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PAGES_KEY, siteId] }),
  });
}

export function useDeletePage(siteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pageId: string) => deletePage(pageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PAGES_KEY, siteId] }),
  });
}
