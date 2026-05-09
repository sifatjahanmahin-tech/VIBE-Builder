import { useState } from 'react';
import { Plus, AlertTriangle, RefreshCw } from 'lucide-react';
import { useMyWebsites, useCreateWebsite } from '../hooks/use-websites';
import { WebsiteCard } from '../components/website-card';
import { CreateWebsiteModal } from '../components/create-website-modal';

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <svg width="180" height="140" viewBox="0 0 180 140" fill="none" aria-hidden>
        <rect x="15" y="15" width="150" height="110" rx="10" fill="#1A1A1A" stroke="#2A2A2A" strokeWidth="1.5"/>
        <rect x="15" y="15" width="150" height="32" rx="10" fill="#222222"/>
        <rect x="15" y="37" width="150" height="10" fill="#222222"/>
        <circle cx="30" cy="31" r="5" fill="#3A3A3A"/>
        <circle cx="44" cy="31" r="5" fill="#3A3A3A"/>
        <circle cx="58" cy="31" r="5" fill="#3A3A3A"/>
        <rect x="72" y="25" width="72" height="12" rx="5" fill="#2A2A2A"/>
        <rect x="28" y="60" width="124" height="18" rx="5" fill="#FF6B35" fillOpacity="0.2"/>
        <rect x="28" y="86" width="90" height="8" rx="3" fill="#2A2A2A"/>
        <rect x="28" y="100" width="68" height="8" rx="3" fill="#2A2A2A"/>
        <rect x="28" y="114" width="46" height="8" rx="3" fill="#2A2A2A"/>
        <circle cx="148" cy="114" r="18" fill="#FF6B35"/>
        <path d="M148 104v20M138 114h20" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>

      <div className="max-w-sm">
        <h2 className="text-2xl font-extrabold text-white">Create your first website</h2>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: '#666' }}>
          VibeBuilder lets you design beautiful websites with drag-and-drop simplicity — no code needed.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
        style={{ backgroundColor: '#FF6B35' }}
      >
        <Plus className="h-4 w-4" />
        Create Your First Website
      </button>
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
    <main className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Top nav bar */}
      <div
        className="sticky top-0 z-10"
        style={{ backgroundColor: '#111111', borderBottom: '1px solid #2A2A2A' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
              style={{ backgroundColor: '#FF6B35' }}
            >
              V
            </div>
            <span className="text-sm font-bold text-white">VibeBuilder</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white">My Websites</h1>
            <p className="text-sm mt-1" style={{ color: '#666' }}>
              {websites.length > 0
                ? `${websites.length} website${websites.length !== 1 ? 's' : ''} — click a page to edit`
                : 'Build and publish websites with drag-and-drop ease'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#FF6B35' }}
          >
            <Plus className="h-4 w-4" />
            New Website
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <>
            <style>{`
              @keyframes vibe-shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
              .vibe-skeleton {
                background: linear-gradient(90deg, #1A1A1A 25%, #262626 50%, #1A1A1A 75%);
                background-size: 200% 100%;
                animation: vibe-shimmer 1.5s infinite;
                border-radius: 6px;
              }
            `}</style>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-xl overflow-hidden" style={{ backgroundColor: '#141414', border: '1px solid #2A2A2A' }}>
                  <div style={{ padding: '20px', borderBottom: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="vibe-skeleton" style={{ width: 40, height: 40, borderRadius: 12 }} />
                    <div style={{ flex: 1 }}>
                      <div className="vibe-skeleton" style={{ height: 12, width: '60%', marginBottom: 8 }} />
                      <div className="vibe-skeleton" style={{ height: 10, width: '40%' }} />
                    </div>
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[0, 1, 2].map((j) => (
                      <div key={j} className="vibe-skeleton" style={{ height: 32, borderRadius: 8 }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div
              className="rounded-full p-5"
              style={{ backgroundColor: '#ef444415' }}
            >
              <AlertTriangle className="h-7 w-7 text-red-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">Failed to load websites</p>
              <p className="text-sm mt-1" style={{ color: '#666' }}>
                {(error as Error)?.message ?? 'An unexpected error occurred.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-80"
              style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        ) : websites.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
