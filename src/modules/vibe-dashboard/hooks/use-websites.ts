import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/state/store/auth';
import { useToast } from '@/hooks/use-toast';
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
    retry: 1,
  });
}

export function useSitePages(siteId: string) {
  return useQuery({
    queryKey: [PAGES_KEY, siteId],
    queryFn: () => getSitePages(siteId),
    enabled: !!siteId,
    retry: 1,
  });
}

export function useCreateWebsite() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.itemId ?? '');
  const { toast } = useToast();
  return useMutation({
    mutationFn: (siteName: string) => createWebsite(siteName, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WEBSITES_KEY, userId] });
      toast({ title: 'Website created', description: 'Your new website is ready.' });
    },
    onError: (err: Error) => {
      toast({
        title: 'Failed to create website',
        description: err.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteWebsite() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.itemId ?? '');
  const { toast } = useToast();
  return useMutation({
    mutationFn: (siteId: string) => deleteWebsite(siteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [WEBSITES_KEY, userId] });
      toast({ title: 'Website deleted' });
    },
    onError: (err: Error) => {
      toast({
        title: 'Failed to delete website',
        description: err.message,
        variant: 'destructive',
      });
    },
  });
}

export function useCreatePage(siteId: string) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.itemId ?? '');
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ pageName, slug }: { pageName: string; slug: string }) =>
      createPage(siteId, userId, pageName, slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PAGES_KEY, siteId] });
      toast({ title: 'Page created', description: 'Your new page has been added.' });
    },
    onError: (err: Error) => {
      toast({
        title: 'Failed to create page',
        description: err.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeletePage(siteId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (pageId: string) => deletePage(pageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PAGES_KEY, siteId] });
      toast({ title: 'Page deleted' });
    },
    onError: (err: Error) => {
      toast({
        title: 'Failed to delete page',
        description: err.message,
        variant: 'destructive',
      });
    },
  });
}
