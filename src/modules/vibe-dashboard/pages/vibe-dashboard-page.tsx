import { useState } from 'react';
import { Plus, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { useMyWebsites, useCreateWebsite } from '../hooks/use-websites';
import { WebsiteCard } from '../components/website-card';
import { CreateWebsiteModal } from '../components/create-website-modal';

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <svg width="180" height="140" viewBox="0 0 180 140" fill="none" aria-hidden>
        <rect x="15" y="15" width="150" height="110" rx="10" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5"/>
        <rect x="15" y="15" width="150" height="32" rx="10" fill="#e2e8f0"/>
        <rect x="15" y="37" width="150" height="10" fill="#e2e8f0"/>
        <circle cx="30" cy="31" r="5" fill="#fca5a5"/>
        <circle cx="44" cy="31" r="5" fill="#fcd34d"/>
        <circle cx="58" cy="31" r="5" fill="#6ee7b7"/>
        <rect x="72" y="25" width="72" height="12" rx="5" fill="#fff"/>
        <rect x="28" y="60" width="124" height="18" rx="5" fill="#6366f1" fillOpacity="0.18"/>
        <rect x="28" y="86" width="90" height="8" rx="3" fill="#e2e8f0"/>
        <rect x="28" y="100" width="68" height="8" rx="3" fill="#e2e8f0"/>
        <rect x="28" y="114" width="46" height="8" rx="3" fill="#e2e8f0"/>
        <circle cx="148" cy="114" r="18" fill="#6366f1"/>
        <path d="M148 104v20M138 114h20" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>

      <div className="max-w-sm">
        <h2 className="text-2xl font-extrabold text-slate-800">Create your first website</h2>
        <p className="text-slate-500 mt-2 leading-relaxed">
          VibeBuilder lets you design beautiful websites with drag-and-drop simplicity — no code needed.
        </p>
      </div>

      <Button
        onClick={onCreate}
        size="lg"
        className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-200 hover:shadow-xl transition-all"
      >
        <Plus className="h-5 w-5" />
        Create Your First Website
      </Button>
    </div>
  );
}

export function VibeDashboardPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: websites = [], isLoading, isError, error, refetch } = useMyWebsites();
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
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto w-full px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              My Websites
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              {websites.length > 0
                ? `${websites.length} website${websites.length !== 1 ? 's' : ''} — click a page to edit it`
                : 'Build and publish websites with drag-and-drop ease'}
            </p>
          </div>

          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            New Website
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-sm text-slate-400">Loading your websites…</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="rounded-full bg-red-50 p-5">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-700">Failed to load websites</p>
              <p className="text-sm text-slate-400 mt-1">
                {(error as Error)?.message ?? 'An unexpected error occurred.'}
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        ) : websites.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {websites.map((site) => (
              <WebsiteCard key={site.siteId} site={site} />
            ))}
          </div>
        )}
      </div>

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
