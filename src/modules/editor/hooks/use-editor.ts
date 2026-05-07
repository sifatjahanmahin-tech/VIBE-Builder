import { useCallback, useEffect, useRef, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import { COMPONENT_DEFINITIONS } from '@/types/vibebuilder';
import type { ComponentType, VibeComponent, VibeComponentProps } from '@/types/vibebuilder';
import { getPageLayout, savePageLayout, publishPage, renamePage } from '@/lib/blocks-api';
import { useToast } from '@/hooks/use-toast';

const AUTO_SAVE_MS = 30_000;

export function useEditor(pageId: string) {
  const { toast } = useToast();
  const [components, setComponents] = useState<VibeComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageName, setPageName] = useState('');
  const [siteId, setSiteId] = useState('');
  const [slug, setSlug] = useState('');

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load page on mount
  useEffect(() => {
    if (!pageId) return;
    setIsLoading(true);
    getPageLayout(pageId)
      .then((layout) => {
        if (layout) {
          setComponents(layout.components);
          setIsPublished(layout.isPublished);
          setPageName(layout.pageName);
          setSiteId(layout.siteId);
          setSlug(layout.slug);
        }
      })
      .finally(() => setIsLoading(false));
  }, [pageId]);

  // Auto-save: debounce 30s after last change
  useEffect(() => {
    if (!isDirty) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleSave();
    }, AUTO_SAVE_MS);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components, isDirty]);

  const handleSave = useCallback(async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setIsSaving(true);
    try {
      await savePageLayout(pageId, components);
      setIsDirty(false);
    } catch (err) {
      toast({ title: 'Save failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [pageId, components, toast]);

  const handlePublishToggle = useCallback(async () => {
    const next = !isPublished;
    setIsPublished(next);
    try {
      await publishPage(pageId, next);
    } catch (err) {
      setIsPublished(!next);
      toast({ title: 'Failed to update publish status', description: (err as Error).message, variant: 'destructive' });
    }
  }, [pageId, isPublished, toast]);

  const addComponent = useCallback((type: ComponentType) => {
    const def = COMPONENT_DEFINITIONS.find((d) => d.type === type);
    if (!def) return;
    const newItem: VibeComponent = {
      id: uuidv4(),
      type,
      order: components.length,
      props: { ...def.defaultProps },
    };
    setComponents((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
    setIsDirty(true);
  }, [components.length]);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
    setIsDirty(true);
  }, []);

  const updateComponentProps = useCallback(
    (id: string, patch: Partial<VibeComponentProps>) => {
      setComponents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, props: { ...c.props, ...patch } as VibeComponentProps } : c))
      );
      setIsDirty(true);
    },
    []
  );

  const handleRenamePage = useCallback(async (newName: string) => {
    setPageName(newName);
    try {
      await renamePage(pageId, newName);
    } catch (err) {
      toast({ title: 'Failed to rename page', description: (err as Error).message, variant: 'destructive' });
    }
  }, [pageId, toast]);

  const reorderComponents = useCallback((activeId: string, overId: string) => {
    setComponents((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === activeId);
      const newIndex = prev.findIndex((c) => c.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex).map((c, i) => ({ ...c, order: i }));
    });
    setIsDirty(true);
  }, []);

  const selectedComponent = components.find((c) => c.id === selectedId) ?? null;

  return {
    components,
    selectedId,
    selectedComponent,
    isPublished,
    isDirty,
    isSaving,
    isLoading,
    pageName,
    siteId,
    slug,
    setSelectedId,
    setPageName,
    addComponent,
    removeComponent,
    updateComponentProps,
    reorderComponents,
    handleSave,
    handlePublishToggle,
    handleRenamePage,
  };
}
