import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui-kit/dialog';
import { Button } from '@/components/ui-kit/button';
import { Input } from '@/components/ui-kit/input';
import { Label } from '@/components/ui-kit/label';

interface CreateWebsiteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function CreateWebsiteModal({
  open,
  onClose,
  onConfirm,
  isLoading,
  error,
}: CreateWebsiteModalProps) {
  const [name, setName] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    // name is intentionally NOT cleared here — parent clears via onClose on success
  }

  function handleClose() {
    setName('');
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Website</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="site-name">Website Name</Label>
            <Input
              id="site-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Site"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
