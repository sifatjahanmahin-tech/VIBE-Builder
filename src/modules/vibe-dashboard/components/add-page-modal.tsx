import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui-kit/dialog';
import { Button } from '@/components/ui-kit/button';
import { Input } from '@/components/ui-kit/input';
import { Label } from '@/components/ui-kit/label';

interface AddPageModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (pageName: string, slug: string) => void;
  isLoading?: boolean;
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function AddPageModal({ open, onClose, onConfirm, isLoading }: AddPageModalProps) {
  const [pageName, setPageName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  function handleNameChange(v: string) {
    setPageName(v);
    if (!slugTouched) setSlug(toSlug(v));
  }

  function handleSlugChange(v: string) {
    setSlugTouched(true);
    setSlug(toSlug(v));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = pageName.trim();
    const s = slug.trim();
    if (!name || !s) return;
    onConfirm(name, s);
    setPageName('');
    setSlug('');
    setSlugTouched(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Page</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="page-name">Page Name</Label>
            <Input
              id="page-name"
              value={pageName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="About Us"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="page-slug">URL Slug</Label>
            <Input
              id="page-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="about-us"
            />
            <p className="text-xs text-muted-foreground">Used in the live URL: /site/…/{slug || 'slug'}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!pageName.trim() || !slug.trim() || isLoading}>
              {isLoading ? 'Adding…' : 'Add Page'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
