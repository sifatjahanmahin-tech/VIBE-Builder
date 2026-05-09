import { useEffect, useRef, useState } from 'react';
import {
  Cloud, Download, ExternalLink, Eye, EyeOff, Keyboard, Loader2,
  Monitor, RotateCcw, RotateCw, Smartphone, Sparkles, Tablet, Upload,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/state/store/auth';

export type Viewport = 'desktop' | 'tablet' | 'mobile';

interface EditorTopbarProps {
  pageName: string;
  slug: string;
  isDirty: boolean;
  isSaving: boolean;
  isPublished: boolean;
  previewMode: boolean;
  viewport: Viewport;
  showAI: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
  onPublishToggle: () => void;
  onPreviewToggle: () => void;
  onRenamePage: (name: string) => void;
  setPageName: (name: string) => void;
  onViewportChange: (v: Viewport) => void;
  onAIToggle: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onImportClick: () => void;
  onShowShortcuts: () => void;
}

export function EditorTopbar({
  pageName, slug, isDirty, isSaving, isPublished, previewMode,
  viewport, showAI, canUndo, canRedo,
  onSave, onPublishToggle, onPreviewToggle, onRenamePage, setPageName,
  onViewportChange, onAIToggle, onUndo, onRedo, onExport, onImportClick,
  onShowShortcuts,
}: EditorTopbarProps) {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.itemId ?? '');
  const [editingName, setEditingName] = useState(false);
  const [localName, setLocalName] = useState(pageName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setLocalName(pageName); }, [pageName]);

  function startEditing() {
    setEditingName(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitName() {
    setEditingName(false);
    const trimmed = localName.trim() || pageName;
    setLocalName(trimmed);
    if (trimmed !== pageName) onRenamePage(trimmed);
    else setPageName(pageName);
  }

  function handleNameKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitName();
    if (e.key === 'Escape') { setLocalName(pageName); setEditingName(false); }
  }

  function openLiveSite() {
    if (userId && slug) window.open(`/site/${userId}/${slug}`, '_blank', 'noopener,noreferrer');
  }

  const saveStatus = isSaving ? 'saving' : isDirty ? 'unsaved' : 'saved';

  const VIEWPORTS: { id: Viewport; icon: React.ReactNode }[] = [
    { id: 'desktop', icon: <Monitor className="h-[15px] w-[15px]" /> },
    { id: 'tablet',  icon: <Tablet  className="h-[15px] w-[15px]" /> },
    { id: 'mobile',  icon: <Smartphone className="h-[15px] w-[15px]" /> },
  ];

  function iconBtn(
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    disabled = false,
    active = false,
  ) {
    return (
      <button
        type="button"
        title={label}
        onClick={onClick}
        disabled={disabled}
        style={{
          width: 32, height: 32, borderRadius: 6,
          backgroundColor: active ? '#FF6B3520' : 'transparent',
          border: active ? '1px solid #FF6B3550' : '1px solid transparent',
          color: disabled ? '#444' : active ? '#FF6B35' : '#888',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { if (!disabled && !active) e.currentTarget.style.color = '#CCC'; }}
        onMouseLeave={(e) => { if (!disabled && !active) e.currentTarget.style.color = '#888'; }}
      >
        {icon}
      </button>
    );
  }

  return (
    <header
      className="flex items-center px-3 gap-2 shrink-0 z-20"
      style={{ height: 56, backgroundColor: '#1A1A1A', borderBottom: '1px solid #2A2A2A' }}
    >
      {/* Orange logo */}
      <div
        className="flex items-center justify-center text-white font-black text-[13px] shrink-0 cursor-pointer select-none"
        style={{ width: 32, height: 32, backgroundColor: '#FF6B35', borderRadius: 8 }}
        onClick={() => navigate('/vibe-dashboard')}
        title="Back to dashboard"
      >
        V
      </div>

      <div style={{ width: 1, height: 20, backgroundColor: '#333' }} />

      {/* Page name + save status */}
      <div className="flex items-center gap-2 min-w-0">
        {editingName ? (
          <input
            ref={inputRef}
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={commitName}
            onKeyDown={handleNameKeyDown}
            autoFocus
            style={{
              background: 'transparent',
              borderBottom: '1px solid #FF6B35',
              color: 'white', fontSize: 14, fontWeight: 600,
              outline: 'none', width: 160,
            }}
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            title="Click to rename"
            style={{
              color: 'white', fontSize: 14, fontWeight: 600,
              background: 'none', border: 'none', cursor: 'pointer',
              maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {pageName || 'Untitled Page'}
          </button>
        )}

        <div className="flex items-center gap-1">
          {saveStatus === 'saving'
            ? <Loader2 style={{ width: 12, height: 12, color: '#888' }} className="animate-spin" />
            : <Cloud style={{ width: 12, height: 12, color: '#888' }} />
          }
          <span style={{ fontSize: 11, color: '#888' }}>
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : 'Unsaved'}
          </span>
        </div>
      </div>

      <div style={{ width: 1, height: 20, backgroundColor: '#333' }} />

      {/* Undo / Redo */}
      {iconBtn('Undo (Ctrl+Z)', <RotateCcw style={{ width: 14, height: 14 }} />, onUndo, !canUndo)}
      {iconBtn('Redo (Ctrl+Y)', <RotateCw  style={{ width: 14, height: 14 }} />, onRedo, !canRedo)}

      {/* Center: viewport toggles */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-0.5 p-1 rounded-lg" style={{ backgroundColor: '#262626' }}>
          {VIEWPORTS.map(({ id, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onViewportChange(id)}
              title={id.charAt(0).toUpperCase() + id.slice(1)}
              style={{
                width: 32, height: 32, borderRadius: 6,
                backgroundColor: viewport === id ? '#FF6B35' : 'transparent',
                color: viewport === id ? 'white' : '#666',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { if (viewport !== id) e.currentTarget.style.color = '#CCC'; }}
              onMouseLeave={(e) => { if (viewport !== id) e.currentTarget.style.color = '#666'; }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-1 shrink-0">
        {/* AI toggle */}
        {iconBtn('AI Assistant', <Sparkles style={{ width: 14, height: 14 }} />, onAIToggle, false, showAI)}

        {/* Keyboard shortcuts */}
        {iconBtn('Keyboard shortcuts (?)', <Keyboard style={{ width: 14, height: 14 }} />, onShowShortcuts)}

        {/* Export */}
        {iconBtn('Export page JSON', <Download style={{ width: 14, height: 14 }} />, onExport)}

        {/* Import */}
        {iconBtn('Import page JSON', <Upload style={{ width: 14, height: 14 }} />, onImportClick)}

        <div style={{ width: 1, height: 20, backgroundColor: '#333' }} />

        {/* Preview button */}
        <button
          type="button"
          onClick={onPreviewToggle}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
            backgroundColor: previewMode ? '#FF6B35' : '#333',
            color: previewMode ? 'white' : '#CCC',
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {previewMode
            ? <EyeOff style={{ width: 13, height: 13 }} />
            : <Eye style={{ width: 13, height: 13 }} />}
          {previewMode ? 'Edit' : 'Preview'}
        </button>

        <div style={{ width: 1, height: 20, backgroundColor: '#333' }} />

        {/* Draft/Published pill */}
        <button
          type="button"
          onClick={onPublishToggle}
          title={isPublished ? 'Click to unpublish' : 'Click to publish'}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            border: `1px solid ${isPublished ? '#10b981' : '#3A3A3A'}`,
            color: isPublished ? '#10b981' : '#888',
            backgroundColor: 'transparent', cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isPublished ? '#10b981' : '#555' }} />
          {isPublished ? 'Published' : 'Draft'}
        </button>

        {/* Save button */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !isDirty}
          style={{
            padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
            backgroundColor: '#333', color: isDirty ? 'white' : '#555',
            border: '1px solid #3A3A3A', cursor: isDirty ? 'pointer' : 'default',
            opacity: isSaving ? 0.6 : 1, transition: 'all 0.15s',
          }}
        >
          Save
        </button>

        {/* Orange Publish button */}
        <button
          type="button"
          onClick={onPublishToggle}
          style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            backgroundColor: '#FF6B35', color: 'white',
            border: 'none', cursor: 'pointer', transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          {isPublished ? 'Unpublish' : 'Publish'}
        </button>

        {/* External link */}
        {isPublished && userId && slug && (
          <button
            type="button"
            onClick={openLiveSite}
            title="Open live site"
            style={{
              width: 32, height: 32, borderRadius: 6, backgroundColor: '#333',
              color: '#888', border: '1px solid #3A3A3A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#FF6B35'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#3A3A3A'; }}
          >
            <ExternalLink style={{ width: 13, height: 13 }} />
          </button>
        )}
      </div>
    </header>
  );
}
