import { ArrowLeft, Eye, EyeOff, ExternalLink, Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui-kit/button';
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
}: EditorTopbarProps) {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.itemId ?? '');

  function openLiveSite() {
    if (userId && slug) {
      window.open(`/site/${userId}/${slug}`, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <header className="flex items-center gap-3 px-4 h-14 border-b bg-white shrink-0 shadow-sm">
      {/* Back */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/vibe-dashboard')}
        title="Back to dashboard"
        className="text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <div className="h-5 w-px bg-slate-200" />

      {/* Page name — centered */}
      <div className="flex-1 flex justify-center">
        <span className="font-semibold text-sm text-slate-800 truncate max-w-xs">
          {pageName || 'Untitled Page'}
        </span>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Save status */}
        <span
          className={cn(
            'text-xs font-medium px-2 py-1 rounded-full transition-colors',
            isSaving
              ? 'bg-amber-50 text-amber-600'
              : isDirty
              ? 'bg-orange-50 text-orange-500'
              : 'bg-emerald-50 text-emerald-600'
          )}
        >
          {isSaving ? 'Saving…' : isDirty ? 'Unsaved' : 'Saved'}
        </span>

        {/* Publish toggle */}
        <button
          type="button"
          onClick={onPublishToggle}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
            isPublished
              ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'
              : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
          )}
          title={isPublished ? 'Click to unpublish' : 'Click to publish'}
        >
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              isPublished ? 'bg-white' : 'bg-slate-400'
            )}
          />
          {isPublished ? 'Published' : 'Draft'}
        </button>

        {/* Save */}
        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving || !isDirty}
          className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </Button>

        {/* Preview toggle */}
        <Button
          size="sm"
          variant="outline"
          onClick={onPreviewToggle}
          className="gap-1.5 text-xs"
          title={previewMode ? 'Back to editing' : 'Preview page'}
        >
          {previewMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {previewMode ? 'Edit' : 'Preview'}
        </Button>

        {/* Open live site */}
        {isPublished && userId && slug && (
          <Button
            size="sm"
            variant="ghost"
            onClick={openLiveSite}
            className="gap-1.5 text-xs text-indigo-600 hover:text-indigo-700"
            title="Open live site in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Live
          </Button>
        )}
      </div>
    </header>
  );
}
