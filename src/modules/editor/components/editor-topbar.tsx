import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Cloud, ExternalLink, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/state/store/auth';
import { cn } from '@/lib/utils';

interface EditorTopbarProps {
  pageName: string;
  slug: string;
  isDirty: boolean;
  isSaving: boolean;
  isPublished: boolean;
  previewMode: boolean;
  onSave: () => void;
  onPublishToggle: () => void;
  onPreviewToggle: () => void;
  onRenamePage: (name: string) => void;
  setPageName: (name: string) => void;
}

export function EditorTopbar({
  pageName,
  slug,
  isDirty,
  isSaving,
  isPublished,
  previewMode,
  onSave,
  onPublishToggle,
  onPreviewToggle,
  onRenamePage,
  setPageName,
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

  return (
    <header
      className="flex items-center gap-3 px-4 shrink-0 z-10"
      style={{ height: 56, backgroundColor: '#111111', borderBottom: '1px solid #2A2A2A' }}
    >
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate('/vibe-dashboard')}
        title="Back to dashboard"
        className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors text-[#888888] hover:text-white hover:bg-[#2A2A2A]"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="w-px h-5 bg-[#2A2A2A]" />

      {/* Page name */}
      <div className="flex items-center min-w-0">
        {editingName ? (
          <input
            ref={inputRef}
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={commitName}
            onKeyDown={handleNameKeyDown}
            className="bg-[#1A1A1A] border border-[#FF6B35] text-white text-sm font-semibold rounded-md px-2 py-1 outline-none w-48"
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            title="Click to rename page"
            className="text-sm font-semibold text-white hover:text-[#FF6B35] transition-colors truncate max-w-[200px] text-left"
          >
            {pageName || 'Untitled Page'}
          </button>
        )}
      </div>

      {/* Center: Edit / Preview tabs */}
      <div className="flex-1 flex justify-center">
        <div
          className="flex items-center rounded-lg p-0.5 gap-0.5"
          style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
        >
          <button
            type="button"
            onClick={() => previewMode && onPreviewToggle()}
            className={cn(
              'px-4 py-1.5 rounded-md text-xs font-semibold transition-all',
              !previewMode
                ? 'bg-[#2A2A2A] text-white shadow-sm'
                : 'text-[#888888] hover:text-white'
            )}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => !previewMode && onPreviewToggle()}
            className={cn(
              'px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5',
              previewMode
                ? 'bg-[#2A2A2A] text-white shadow-sm'
                : 'text-[#888888] hover:text-white'
            )}
          >
            {previewMode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            Preview
          </button>
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Save status */}
        <div className="flex items-center gap-1.5">
          {saveStatus === 'saving' ? (
            <Loader2 className="h-3.5 w-3.5 text-[#888888] animate-spin" />
          ) : (
            <Cloud className={cn('h-3.5 w-3.5', saveStatus === 'saved' ? 'text-emerald-400' : 'text-amber-400')} />
          )}
          <span
            className={cn(
              'text-xs font-medium',
              saveStatus === 'saving' ? 'text-[#888888]' :
              saveStatus === 'saved'  ? 'text-emerald-400' : 'text-amber-400'
            )}
          >
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : 'Unsaved'}
          </span>
        </div>

        <div className="w-px h-4 bg-[#2A2A2A]" />

        {/* Draft/Published pill */}
        <button
          type="button"
          onClick={onPublishToggle}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border',
            isPublished
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-[#1A1A1A] text-[#888888] border-[#2A2A2A] hover:border-[#444] hover:text-white'
          )}
          title={isPublished ? 'Click to unpublish' : 'Click to publish'}
        >
          <span className={cn('w-1.5 h-1.5 rounded-full', isPublished ? 'bg-emerald-400' : 'bg-[#555555]')} />
          {isPublished ? 'Published' : 'Draft'}
        </button>

        {/* Save button */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !isDirty}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-[#1A1A1A] border border-[#2A2A2A] text-[#888888] hover:text-white hover:border-[#444] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save
        </button>

        {/* Orange Publish button */}
        <button
          type="button"
          onClick={onPublishToggle}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-white hover:opacity-90 active:scale-95"
          style={{ backgroundColor: '#FF6B35' }}
        >
          {isPublished ? 'Unpublish' : 'Publish'}
        </button>

        {/* Open live site */}
        {isPublished && userId && slug && (
          <button
            type="button"
            onClick={openLiveSite}
            title="Open live site in new tab"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#888888] hover:text-white hover:bg-[#2A2A2A] transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </header>
  );
}
