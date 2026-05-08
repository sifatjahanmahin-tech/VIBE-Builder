import { useCallback, useEffect, useRef, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import { COMPONENT_DEFINITIONS } from '@/types/vibebuilder';
import type { ComponentType, VibeComponent, VibeComponentProps } from '@/types/vibebuilder';
import { getPageLayout, savePageLayout, publishPage, renamePage } from '@/lib/blocks-api';
import { useToast } from '@/hooks/use-toast';

const AUTO_SAVE_MS = 30_000;
const MAX_HISTORY = 50;

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

  // Undo / redo
  const undoStack = useRef<VibeComponent[][]>([]);
  const redoStack = useRef<VibeComponent[][]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pushHistory(snapshot: VibeComponent[]) {
    undoStack.current = [...undoStack.current.slice(-(MAX_HISTORY - 1)), [...snapshot]];
    redoStack.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }

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
    setComponents((prev) => {
      pushHistory(prev);
      const newItem: VibeComponent = {
        id: uuidv4(),
        type,
        order: prev.length,
        props: { ...def.defaultProps },
      };
      setSelectedId(newItem.id);
      setIsDirty(true);
      return [...prev, newItem];
    });
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => {
      pushHistory(prev);
      setSelectedId((sel) => (sel === id ? null : sel));
      setIsDirty(true);
      return prev.filter((c) => c.id !== id);
    });
  }, []);

  const updateComponentProps = useCallback(
    (id: string, patch: Partial<VibeComponentProps>) => {
      setComponents((prev) => {
        pushHistory(prev);
        setIsDirty(true);
        return prev.map((c) => (c.id === id ? { ...c, props: { ...c.props, ...patch } as VibeComponentProps } : c));
      });
    },
    []
  );

  // Replace all components at once (used by AI generator) — no history push (too large)
  const setComponentsBatch = useCallback((next: VibeComponent[]) => {
    setComponents((prev) => {
      pushHistory(prev);
      setIsDirty(true);
      return next;
    });
    setSelectedId(null);
  }, []);

  const undo = useCallback(() => {
    const snapshot = undoStack.current.pop();
    if (!snapshot) return;
    setComponents((cur) => {
      redoStack.current = [...redoStack.current, [...cur]];
      setCanUndo(undoStack.current.length > 0);
      setCanRedo(true);
      setIsDirty(true);
      return snapshot;
    });
  }, []);

  const redo = useCallback(() => {
    const snapshot = redoStack.current.pop();
    if (!snapshot) return;
    setComponents((cur) => {
      undoStack.current = [...undoStack.current, [...cur]];
      setCanUndo(true);
      setCanRedo(redoStack.current.length > 0);
      setIsDirty(true);
      return snapshot;
    });
  }, []);

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
      pushHistory(prev);
      const oldIndex = prev.findIndex((c) => c.id === activeId);
      const newIndex = prev.findIndex((c) => c.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      setIsDirty(true);
      return arrayMove(prev, oldIndex, newIndex).map((c, i) => ({ ...c, order: i }));
    });
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
    canUndo,
    canRedo,
    setSelectedId,
    setPageName,
    setSlug,
    addComponent,
    removeComponent,
    updateComponentProps,
    setComponentsBatch,
    reorderComponents,
    handleSave,
    handlePublishToggle,
    handleRenamePage,
    undo,
    redo,
  };
}
