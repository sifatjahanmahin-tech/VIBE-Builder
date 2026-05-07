import { useState } from 'react';
import { LayoutTemplate, Type, Images, Mail, Quote, Zap, Megaphone, Search } from 'lucide-react';
import { ComponentType, COMPONENT_DEFINITIONS } from '@/types/vibebuilder';

const ICONS: Record<ComponentType, React.ReactNode> = {
  [ComponentType.Hero]:         <LayoutTemplate className="h-5 w-5" />,
  [ComponentType.TextBlock]:    <Type className="h-5 w-5" />,
  [ComponentType.ImageGallery]: <Images className="h-5 w-5" />,
  [ComponentType.ContactForm]:  <Mail className="h-5 w-5" />,
  [ComponentType.Testimonial]:  <Quote className="h-5 w-5" />,
  [ComponentType.FeaturesGrid]: <Zap className="h-5 w-5" />,
  [ComponentType.CTABanner]:    <Megaphone className="h-5 w-5" />,
};

const CATEGORIES: { label: string; types: ComponentType[] }[] = [
  { label: 'Layout',      types: [ComponentType.Hero, ComponentType.CTABanner] },
  { label: 'Content',     types: [ComponentType.TextBlock, ComponentType.Testimonial, ComponentType.FeaturesGrid] },
  { label: 'Media',       types: [ComponentType.ImageGallery] },
  { label: 'Interactive', types: [ComponentType.ContactForm] },
];

interface ComponentPaletteProps {
  onAdd: (type: ComponentType) => void;
}

export function ComponentPalette({ onAdd }: ComponentPaletteProps) {
  const [query, setQuery] = useState('');

  const allDefs = COMPONENT_DEFINITIONS.filter((d) =>
    !query || d.label.toLowerCase().includes(query.toLowerCase()) || d.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCategories = query
    ? [{ label: 'Results', types: allDefs.map((d) => d.type) }]
    : CATEGORIES;

  return (
    <aside
      className="shrink-0 flex flex-col overflow-hidden"
      style={{ width: 280, backgroundColor: '#141414', borderRight: '1px solid #2A2A2A' }}
    >
      {/* Header */}
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid #2A2A2A' }}>
        <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: '#888888' }}>
          Blocks
        </p>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#555' }} />
          <input
            type="search"
            placeholder="Search blocks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg outline-none transition-colors"
            style={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #2A2A2A',
              color: '#FFFFFF',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; }}
          />
        </div>
      </div>

      {/* Blocks list */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#2A2A2A transparent' }}
      >
        {filteredCategories.map((cat) => {
          const defs = COMPONENT_DEFINITIONS.filter((d) => cat.types.includes(d.type));
          if (!defs.length) return null;
          return (
            <div key={cat.label}>
              <p
                className="text-[10px] font-bold tracking-widest uppercase px-1 mb-2"
                style={{ color: '#555555' }}
              >
                {cat.label}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {defs.map((def) => (
                  <button
                    key={def.type}
                    type="button"
                    onClick={() => onAdd(def.type)}
                    className="flex flex-col items-center gap-2 rounded-lg p-3 text-center transition-all duration-150 group select-none"
                    style={{ backgroundColor: '#1E1E1E', border: '1px solid #2A2A2A' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#FF6B35';
                      e.currentTarget.style.backgroundColor = '#252525';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#2A2A2A';
                      e.currentTarget.style.backgroundColor = '#1E1E1E';
                    }}
                    title={def.description}
                  >
                    <span style={{ color: '#888888' }} className="group-hover:text-[#FF6B35] transition-colors">
                      {ICONS[def.type]}
                    </span>
                    <span className="text-[11px] font-medium leading-tight text-white">
                      {def.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {filteredCategories.every((cat) =>
          !COMPONENT_DEFINITIONS.filter((d) => cat.types.includes(d.type)).length
        ) && (
          <p className="text-xs text-center py-8" style={{ color: '#555' }}>
            No blocks match &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {/* Footer hint */}
      <div
        className="px-4 py-2.5 text-center shrink-0"
        style={{ borderTop: '1px solid #2A2A2A' }}
      >
        <p className="text-[10px]" style={{ color: '#444' }}>Click to add block to canvas</p>
      </div>
    </aside>
  );
}
