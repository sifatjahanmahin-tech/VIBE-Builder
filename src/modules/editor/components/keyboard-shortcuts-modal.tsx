import { X } from 'lucide-react';

interface ShortcutRow {
  keys: string[];
  label: string;
}

const SHORTCUTS: { section: string; rows: ShortcutRow[] }[] = [
  {
    section: 'File',
    rows: [
      { keys: ['Ctrl', 'S'], label: 'Save page' },
      { keys: ['Ctrl', 'P'], label: 'Publish / Unpublish' },
    ],
  },
  {
    section: 'Edit',
    rows: [
      { keys: ['Ctrl', 'Z'], label: 'Undo' },
      { keys: ['Ctrl', 'Y'], label: 'Redo' },
      { keys: ['Ctrl', 'D'], label: 'Duplicate selected block' },
      { keys: ['Delete'], label: 'Remove selected block' },
    ],
  },
  {
    section: 'Navigation',
    rows: [
      { keys: ['Escape'], label: 'Deselect block / Close AI panel' },
      { keys: ['?'], label: 'Show keyboard shortcuts' },
    ],
  },
];

function KeyChip({ label }: { label: string }) {
  return (
    <kbd
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 26, padding: '2px 6px', borderRadius: 5,
        fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
        backgroundColor: '#2A2A2A', border: '1px solid #3A3A3A',
        color: '#CCC', lineHeight: 1.5,
      }}
    >
      {label}
    </kbd>
  );
}

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        backgroundColor: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: '100%', maxWidth: 440,
          backgroundColor: '#141414', border: '1px solid #2A2A2A',
          borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid #2A2A2A',
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Keyboard Shortcuts</p>
            <p style={{ fontSize: 11, color: '#555', marginTop: 2 }}>Press <KeyChip label="?" /> anytime to open this</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
              backgroundColor: 'transparent', color: '#555',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.backgroundColor = '#2A2A2A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {/* Shortcuts */}
        <div style={{ padding: '8px 18px 18px' }}>
          {SHORTCUTS.map((section) => (
            <div key={section.section} style={{ marginTop: 16 }}>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#FF6B35', marginBottom: 8,
              }}>
                {section.section}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {section.rows.map((row) => (
                  <div key={row.label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 10px', borderRadius: 7,
                    backgroundColor: '#1A1A1A', border: '1px solid #222',
                  }}>
                    <span style={{ fontSize: 12, color: '#CCC' }}>{row.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {row.keys.map((k, i) => (
                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {i > 0 && <span style={{ fontSize: 10, color: '#555' }}>+</span>}
                          <KeyChip label={k} />
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
