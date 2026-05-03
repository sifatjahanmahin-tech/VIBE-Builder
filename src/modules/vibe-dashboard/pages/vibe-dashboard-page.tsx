import { useState } from 'react';
import { Plus, Loader2, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { useMyWebsites, useCreateWebsite } from '../hooks/use-websites';
import { WebsiteCard } from '../components/website-card';
import { CreateWebsiteModal } from '../components/create-website-modal';

export function VibeDashboardPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: websites = [], isLoading } = useMyWebsites();
  const createMut = useCreateWebsite();

  function handleCreate(name: string) {
    createMut.mutate(name, {
      onSuccess: () => {
        setCreateOpen(false);
        createMut.reset();
      },
    });
  }

  return (
    <main className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">My Websites</h1>
            <p className="text-sm text-muted-foreground">
              Build and manage your drag-and-drop websites
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Website
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : websites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="rounded-full bg-muted p-6">
            <LayoutDashboard className="h-10 w-10 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-medium">No websites yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click &quot;New Website&quot; to create your first site.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Website
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {websites.map((site) => (
            <WebsiteCard key={site.siteId} site={site} />
          ))}
        </div>
      )}

      <CreateWebsiteModal
        open={createOpen}
        onClose={() => { setCreateOpen(false); createMut.reset(); }}
        onConfirm={handleCreate}
        isLoading={createMut.isPending}
        error={createMut.error ? (createMut.error as Error).message : null}
      />
    </main>
  );
}
