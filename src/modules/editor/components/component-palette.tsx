import { useState } from 'react';
import {
  Layers, FileText, Settings2, Search,
  LayoutTemplate, Type, Images, Mail, Quote, Zap, Megaphone,
} from 'lucide-react';
import { ComponentType, COMPONENT_DEFINITIONS } from '@/types/vibebuilder';

// White line icons (24px) per component type
const COMP_ICONS: Record<ComponentType, React.ReactNode> = {
  [ComponentType.Hero]:         <LayoutTemplate className="h-5 w-5" />,
  [ComponentType.TextBlock]:    <Type className="h-5 w-5" />,
  [ComponentType.ImageGallery]: <Images className="h-5 w-5" />,
  [ComponentType.ContactForm]:  <Mail className="h-5 w-5" />,
  [ComponentType.Testimonial]:  <Quote className="h-5 w-5" />,
  [ComponentType.FeaturesGrid]: <Zap className="h-5 w-5" />,
  [ComponentType.CTABanner]:    <Megaphone className="h-5 w-5" />,
};

const CATEGORIES: { label: string; types: ComponentType[] }[] = [
  { label: 'LAYOUT',      types: [ComponentType.Hero, ComponentType.CTABanner] },
  { label: 'CONTENT',     types: [ComponentType.TextBlock, ComponentType.Testimonial, ComponentType.FeaturesGrid] },
  { label: 'MEDIA',       types: [ComponentType.ImageGallery] },
  { label: 'INTERACTIVE', types: [ComponentType.ContactForm] },
];

type PanelTab = 'elements' | 'pages' | 'settings';

interface ComponentPaletteProps {
  onAdd: (type: ComponentType) => void;
}

export function ComponentPalette({ onAdd }: ComponentPaletteProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('elements');
  const [query, setQuery] = useState('');

  const STRIP_ICONS: { id: PanelTab; icon: React.ReactNode; label: string }[] = [
    { id: 'elements', icon: <Layers className="h-[18px] w-[18px]" />, label: 'Elements' },
    { id: 'pages',    icon: <FileText className="h-[18px] w-[18px]" />, label: 'Pages' },
  ];

  return (
    <div className="flex shrink-0 h-full" style={{ borderRight: '1px solid #2A2A2A' }}>

      {/* ── Icon strip (48px) ── */}
      <div
        className="flex flex-col items-center pt-2 pb-2 shrink-0"
        style={{ width: 48, backgroundColor: '#1A1A1A', borderRight: '1px solid #2A2A2A' }}
      >
        {STRIP_ICONS.map(({ id, icon, label }) => (
          <button
            key={id}
            type="button"
            title={label}
            onClick={() => setActiveTab(id)}
            style={{
              width: 36, height: 36, borderRadius: 8, marginBottom: 4,
              backgroundColor: activeTab === id ? '#FF6B35' : 'transparent',
              color: activeTab === id ? 'white' : '#666',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { if (activeTab !== id) e.currentTarget.style.color = '#CCC'; }}
            onMouseLeave={(e) => { if (activeTab !== id) e.currentTarget.style.color = '#666'; }}
          >
            {icon}
          </button>
        ))}

        {/* Settings pinned to bottom */}
        <div style={{ marginTop: 'auto' }}>
          <button
            type="button"
            title="Settings"
            style={{
              width: 36, height: 36, borderRadius: 8,
              backgroundColor: 'transparent', color: '#555',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#CCC'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; }}
          >
            <Settings2 className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* ── Elements panel (280px) ── */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ width: 280, backgroundColor: '#262626' }}
      >
        {/* Header */}
        <div style={{ padding: '12px 12px 0', borderBottom: '1px solid #333', flexShrink: 0 }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#888', marginBottom: 10,
          }}>
            {activeTab === 'elements' ? 'Elements' : activeTab === 'pages' ? 'Pages' : 'Settings'}
          </p>

          {activeTab === 'elements' && (
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search style={{
                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                width: 13, height: 13, color: '#666', pointerEvents: 'none',
              }} />
              <input
                type="search"
                placeholder="Search elements"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: '100%', paddingLeft: 28, paddingRight: 8, paddingTop: 7, paddingBottom: 7,
                  backgroundColor: '#333', border: '1px solid #3A3A3A', borderRadius: 6,
                  color: 'white', fontSize: 12, outline: 'none',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#3A3A3A'; }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: 12, scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}
        >
          {activeTab === 'elements' && (
            <>
              {CATEGORIES.map((cat) => {
                const defs = COMPONENT_DEFINITIONS.filter(
                  (d) => cat.types.includes(d.type) &&
                    (!query || d.label.toLowerCase().includes(query.toLowerCase()) ||
                     d.description.toLowerCase().includes(query.toLowerCase()))
                );
                if (!defs.length) return null;
                return (
                  <div key={cat.label} style={{ marginBottom: 16 }}>
                    <p style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: '#555', marginBottom: 8, padding: '0 2px',
                    }}>
                      {cat.label}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {defs.map((def) => (
                        <button
                          key={def.type}
                          type="button"
                          onClick={() => onAdd(def.type)}
                          title={def.description}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', gap: 6, padding: '10px 6px',
                            backgroundColor: '#333', border: '1px solid #3A3A3A',
                            borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                            minHeight: 76,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#3A3A3A';
                            e.currentTarget.style.borderColor = '#FF6B35';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#333';
                            e.currentTarget.style.borderColor = '#3A3A3A';
                          }}
                        >
                          <span style={{ color: '#CCC', display: 'flex' }}>
                            {COMP_ICONS[def.type]}
                          </span>
                          <span style={{
                            fontSize: 10, color: '#CCC', textAlign: 'center',
                            lineHeight: 1.3, fontWeight: 500,
                          }}>
                            {def.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {CATEGORIES.every((cat) =>
                !COMPONENT_DEFINITIONS.filter((d) => cat.types.includes(d.type) &&
                  (!query || d.label.toLowerCase().includes(query.toLowerCase()))).length
              ) && (
                <p style={{ fontSize: 12, color: '#555', textAlign: 'center', paddingTop: 32 }}>
                  No elements match your search.
                </p>
              )}
            </>
          )}

          {activeTab === 'pages' && (
            <p style={{ fontSize: 12, color: '#555', textAlign: 'center', paddingTop: 32 }}>
              Page management coming soon.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
