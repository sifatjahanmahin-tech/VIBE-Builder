import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor } from '../hooks/use-editor';
import { EditorTopbar } from '../components/editor-topbar';
import type { Viewport } from '../components/editor-topbar';
import { ComponentPalette } from '../components/component-palette';
import { EditorCanvas } from '../components/editor-canvas';
import { PropertyEditor } from '../components/property-editor';
import { AIAssistantPanel } from '../components/ai-assistant-panel';
import { KeyboardShortcutsModal } from '../components/keyboard-shortcuts-modal';
import { deletePage, updatePageSlug } from '@/lib/blocks-api';

export function EditorPage() {
  const { siteId = '', pageId = '' } = useParams<{ siteId: string; pageId: string }>();
  const navigate = useNavigate();

  const [previewMode, setPreviewMode] = useState(false);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [showAI, setShowAI] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const {
    components, selectedId, selectedComponent,
    isPublished, isDirty, isSaving, isLoading,
    pageName, slug,
    seoTitle, seoDescription, ogImage,
    customCss, customJs,
    primaryColor, secondaryColor, fontFamily,
    canUndo, canRedo,
    setSelectedId, setPageName, setSlug,
    addComponent, removeComponent, duplicateComponent, updateComponentProps,
    setComponentsBatch, reorderComponents,
    handleSave, handlePublishToggle, handleRenamePage,
    undo, redo, updatePageMeta, handleUpdateSiteDesign,
  } = useEditor(pageId);

  // ── Browser tab title ─────────────────────────────────────────────────────
  useEffect(() => {
    document.title = pageName ? `${pageName} — VibeBuilder` : 'VibeBuilder';
    return () => { document.title = 'VibeBuilder'; };
  }, [pageName]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if (ctrl && e.key === 's') { e.preventDefault(); if (isDirty && !isSaving) void handleSave(); }
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if (ctrl && e.key === 'p') { e.preventDefault(); void handlePublishToggle(); }
      if (ctrl && e.key === 'd') { e.preventDefault(); if (selectedId) duplicateComponent(selectedId); }

      if (!inInput) {
        if (e.key === 'Escape') { setSelectedId(null); setShowAI(false); setShowShortcuts(false); }
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
          removeComponent(selectedId);
        }
        if (e.key === '?') { setShowShortcuts((v) => !v); }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDirty, isSaving, handleSave, undo, redo, handlePublishToggle, selectedId, duplicateComponent, removeComponent, setSelectedId]);

  async function handleUpdateSlug(newSlug: string) {
    setSlug(newSlug);
    await updatePageSlug(pageId, newSlug);
  }

  async function handleDeletePage() {
    await deletePage(pageId);
    navigate('/vibe-dashboard');
  }

  function handleExport() {
    const filename = `${slug || 'page'}-export.json`;
    const blob = new Blob([JSON.stringify(components, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() { importRef.current?.click(); }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (Array.isArray(parsed)) setComponentsBatch(parsed);
      } catch { /* ignore invalid JSON */ }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999, backgroundColor: '#1A1A1A' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#FF6B35', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: '#666' }}>Loading editor…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile/tablet warning — shown below lg breakpoint */}
      <div
        className="lg:hidden fixed inset-0 flex flex-col items-center justify-center gap-4 text-center px-8"
        style={{ zIndex: 99999, backgroundColor: '#1A1A1A' }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: 12, backgroundColor: '#FF6B3520',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>
          🖥️
        </div>
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 8 }}>
            Editor works best on desktop
          </p>
          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
            Please open VibeBuilder on a screen wider than 1024px for the best experience.
          </p>
        </div>
      </div>

      {/* Full-screen editor — hidden on small screens */}
      <div
        className="hidden lg:flex fixed inset-0 flex-col overflow-hidden"
        style={{ zIndex: 9999, backgroundColor: '#1A1A1A' }}
      >
        <input ref={importRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleImportFile} />

        <EditorTopbar
          pageName={pageName} slug={slug} isDirty={isDirty} isSaving={isSaving}
          isPublished={isPublished} previewMode={previewMode}
          viewport={viewport} showAI={showAI} canUndo={canUndo} canRedo={canRedo}
          onSave={handleSave} onPublishToggle={handlePublishToggle}
          onPreviewToggle={() => setPreviewMode((p) => !p)}
          onRenamePage={handleRenamePage} setPageName={setPageName}
          onViewportChange={setViewport} onAIToggle={() => setShowAI((v) => !v)}
          onUndo={undo} onRedo={redo} onExport={handleExport} onImportClick={handleImportClick}
          onShowShortcuts={() => setShowShortcuts((v) => !v)}
        />

        <div className="flex flex-1 overflow-hidden" style={{ position: 'relative' }}>
          {!previewMode && (
            <ComponentPalette
              onAdd={addComponent}
              siteId={siteId} pageId={pageId} slug={slug} pageName={pageName}
              seoTitle={seoTitle} seoDescription={seoDescription} ogImage={ogImage}
              customCss={customCss} customJs={customJs}
              primaryColor={primaryColor} secondaryColor={secondaryColor} fontFamily={fontFamily}
              onUpdateSlug={handleUpdateSlug}
              onDeletePage={handleDeletePage}
              onUpdatePageMeta={updatePageMeta}
              onUpdateSiteDesign={handleUpdateSiteDesign}
            />
          )}

          <EditorCanvas
            components={components} selectedId={selectedId}
            previewMode={previewMode} viewport={viewport}
            onSelect={setSelectedId} onRemove={removeComponent}
            onReorder={reorderComponents} onDuplicate={duplicateComponent}
          />

          {!previewMode && (
            <PropertyEditor
              component={selectedComponent}
              onChange={(patch) => selectedId && updateComponentProps(selectedId, patch)}
            />
          )}

          {!previewMode && (
            <AIAssistantPanel
              isOpen={showAI} onClose={() => setShowAI(false)}
              selectedComponent={selectedComponent}
              components={components}
              onSetComponents={setComponentsBatch}
              onUpdateProps={(patch) => selectedId && updateComponentProps(selectedId, patch)}
            />
          )}
        </div>
      </div>

      <KeyboardShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </>
  );
}
