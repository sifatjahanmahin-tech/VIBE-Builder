import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface AddPageModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (pageName: string, slug: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const inputStyle: React.CSSProperties = {
  backgroundColor: '#1A1A1A',
  border: '1px solid #2A2A2A',
  color: '#fff',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 13,
  outline: 'none',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: '#666',
};

export function AddPageModal({ open, onClose, onConfirm, isLoading, error }: AddPageModalProps) {
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

  function handleClose() {
    setPageName('');
    setSlug('');
    setSlugTouched(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="w-full max-w-md rounded-xl shadow-2xl"
        style={{ backgroundColor: '#141414', border: '1px solid #2A2A2A' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #2A2A2A' }}
        >
          <h2 className="text-sm font-bold text-white">Add New Page</h2>
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#555' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.backgroundColor = '#2A2A2A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="page-name" style={labelStyle}>Page Name</label>
            <input
              id="page-name"
              type="text"
              value={pageName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="About Us"
              autoFocus
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="page-slug" style={labelStyle}>URL Slug</label>
            <input
              id="page-slug"
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="about-us"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; }}
            />
            <p style={{ fontSize: 11, color: '#555' }}>
              Live URL: /site/…/{slug || 'slug'}
            </p>
          </div>

          {error && (
            <div
              className="flex items-start gap-2 rounded-lg px-3 py-2.5"
              style={{ backgroundColor: '#ef444415', border: '1px solid #ef444430' }}
            >
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', color: '#888' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!pageName.trim() || !slug.trim() || isLoading}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#FF6B35' }}
            >
              {isLoading ? 'Adding…' : 'Add Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
