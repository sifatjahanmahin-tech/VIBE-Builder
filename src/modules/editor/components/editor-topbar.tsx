import { ArrowLeft, Cloud, CloudOff, Globe, GlobeLock, Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui-kit/button';
import { Badge } from '@/components/ui-kit/badge';
import { Switch } from '@/components/ui-kit/switch';
import { Label } from '@/components/ui-kit/label';

interface EditorTopbarProps {
  pageName: string;
  siteId: string;
  isDirty: boolean;
  isSaving: boolean;
  isPublished: boolean;
  onSave: () => void;
  onPublishToggle: () => void;
}

export function EditorTopbar({
  pageName,
  siteId,
  isDirty,
  isSaving,
  isPublished,
  onSave,
  onPublishToggle,
}: EditorTopbarProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-3 px-4 h-14 border-b bg-background shrink-0">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(siteId ? `/vibe-dashboard` : '/vibe-dashboard')}
        title="Back to dashboard"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <div className="h-5 w-px bg-border" />

      <span className="font-semibold text-sm truncate max-w-xs">{pageName || 'Page Editor'}</span>

      {isDirty && !isSaving && (
        <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
          <CloudOff className="h-3 w-3" />
          Unsaved
        </Badge>
      )}
      {isSaving && (
        <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving…
        </Badge>
      )}
      {!isDirty && !isSaving && (
        <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
          <Cloud className="h-3 w-3" />
          Saved
        </Badge>
      )}

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          {isPublished ? (
            <Globe className="h-4 w-4 text-green-500" />
          ) : (
            <GlobeLock className="h-4 w-4 text-muted-foreground" />
          )}
          <Label htmlFor="publish-toggle" className="text-sm cursor-pointer">
            {isPublished ? 'Published' : 'Draft'}
          </Label>
          <Switch
            id="publish-toggle"
            checked={isPublished}
            onCheckedChange={onPublishToggle}
          />
        </div>

        <Button size="sm" onClick={onSave} disabled={isSaving || !isDirty} className="gap-2">
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save
        </Button>
      </div>
    </header>
  );
}
