import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useEditor } from '../hooks/use-editor';
import { EditorTopbar } from '../components/editor-topbar';
import { ComponentPalette } from '../components/component-palette';
import { EditorCanvas } from '../components/editor-canvas';
import { PropertyEditor } from '../components/property-editor';

export function EditorPage() {
  const { pageId = '' } = useParams<{ siteId: string; pageId: string }>();

  const {
    components,
    selectedId,
    selectedComponent,
    isPublished,
    isDirty,
    isSaving,
    isLoading,
    pageName,
    siteId,
    setSelectedId,
    addComponent,
    removeComponent,
    updateComponentProps,
    reorderComponents,
    handleSave,
    handlePublishToggle,
  } = useEditor(pageId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <EditorTopbar
        pageName={pageName}
        siteId={siteId}
        isDirty={isDirty}
        isSaving={isSaving}
        isPublished={isPublished}
        onSave={handleSave}
        onPublishToggle={handlePublishToggle}
      />

      <div className="flex flex-1 overflow-hidden">
        <ComponentPalette onAdd={addComponent} />

        <EditorCanvas
          components={components}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onRemove={removeComponent}
          onReorder={reorderComponents}
        />

        <PropertyEditor
          component={selectedComponent}
          onChange={(patch) => selectedId && updateComponentProps(selectedId, patch)}
        />
      </div>
    </div>
  );
}
