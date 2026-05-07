import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor } from '../hooks/use-editor';
import { EditorTopbar } from '../components/editor-topbar';
import { ComponentPalette } from '../components/component-palette';
import { EditorCanvas } from '../components/editor-canvas';
import { PropertyEditor } from '../components/property-editor';
import { deletePage, updatePageSlug } from '@/lib/blocks-api';
import { useState } from 'react';

export function EditorPage() {
  const { siteId = '', pageId = '' } = useParams<{ siteId: string; pageId: string }>();
  const navigate = useNavigate();
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
    setPageName,
    setSlug,
    addComponent,
    removeComponent,
    updateComponentProps,
    reorderComponents,
    handleSave,
    handlePublishToggle,
    handleRenamePage,
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

  async function handleUpdateSlug(newSlug: string) {
    setSlug(newSlug);
    await updatePageSlug(pageId, newSlug);
  }

  async function handleDeletePage() {
    await deletePage(pageId);
    navigate('/vibe-dashboard');
  }

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: '#1A1A1A' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: '#FF6B35', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: '#666' }}>Loading editor…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ backgroundColor: '#1A1A1A' }}
    >
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
        onRenamePage={handleRenamePage}
        setPageName={setPageName}
      />

      <div className="flex flex-1 overflow-hidden">
        {!previewMode && (
          <ComponentPalette
            onAdd={addComponent}
            siteId={siteId}
            pageId={pageId}
            slug={slug}
            pageName={pageName}
            onUpdateSlug={handleUpdateSlug}
            onDeletePage={handleDeletePage}
          />
        )}

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
