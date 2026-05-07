import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useEditor } from '../hooks/use-editor';
import { EditorTopbar } from '../components/editor-topbar';
import { ComponentPalette } from '../components/component-palette';
import { EditorCanvas } from '../components/editor-canvas';
import { PropertyEditor } from '../components/property-editor';

export function EditorPage() {
  const { pageId = '' } = useParams<{ siteId: string; pageId: string }>();
  const [previewMode, setPreviewMode] = useState(false);

  const {
    components,
    selectedId,
    selectedComponent,
    isPublished,
    isDirty,
    isSaving,
    isLoading,
    pageName,
    slug,
    setSelectedId,
    addComponent,
    removeComponent,
    updateComponentProps,
    reorderComponents,
    handleSave,
    handlePublishToggle,
  } = useEditor(pageId);

  // Ctrl+S to save
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty && !isSaving) handleSave();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDirty, isSaving, handleSave]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-muted-foreground">Loading editor…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <EditorTopbar
        pageName={pageName}
        slug={slug}
        isDirty={isDirty}
        isSaving={isSaving}
        isPublished={isPublished}
        previewMode={previewMode}
        onSave={handleSave}
        onPublishToggle={handlePublishToggle}
        onPreviewToggle={() => setPreviewMode((p) => !p)}
      />

      <div className="flex flex-1 overflow-hidden">
        {!previewMode && <ComponentPalette onAdd={addComponent} />}

        <EditorCanvas
          components={components}
          selectedId={selectedId}
          previewMode={previewMode}
          onSelect={setSelectedId}
          onRemove={removeComponent}
          onReorder={reorderComponents}
        />

        {!previewMode && (
          <PropertyEditor
            component={selectedComponent}
            onChange={(patch) => selectedId && updateComponentProps(selectedId, patch)}
          />
        )}
      </div>
    </div>
  );
}
