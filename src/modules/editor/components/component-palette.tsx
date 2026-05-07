import { ComponentType, COMPONENT_DEFINITIONS } from '@/types/vibebuilder';

const ICONS: Record<ComponentType, string> = {
  [ComponentType.Hero]:        '🖼️',
  [ComponentType.TextBlock]:   '📝',
  [ComponentType.ImageGallery]:'🗃️',
  [ComponentType.ContactForm]: '✉️',
  [ComponentType.Testimonial]: '💬',
  [ComponentType.FeaturesGrid]:'⚡',
  [ComponentType.CTABanner]:   '🚀',
};

const CATEGORIES: { label: string; types: ComponentType[] }[] = [
  {
    label: 'Layout',
    types: [ComponentType.Hero, ComponentType.CTABanner],
  },
  {
    label: 'Content',
    types: [ComponentType.TextBlock, ComponentType.Testimonial, ComponentType.FeaturesGrid],
  },
  {
    label: 'Media',
    types: [ComponentType.ImageGallery],
  },
  {
    label: 'Interactive',
    types: [ComponentType.ContactForm],
  },
];

interface ComponentPaletteProps {
  onAdd: (type: ComponentType) => void;
}

export function ComponentPalette({ onAdd }: ComponentPaletteProps) {
  return (
    <aside className="w-60 shrink-0 border-r bg-slate-50 flex flex-col overflow-y-auto">
      <div className="px-4 py-3.5 border-b bg-white">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Add Blocks</p>
      </div>

      <div className="flex flex-col gap-1 p-3 flex-1">
        {CATEGORIES.map((cat) => {
          const defs = COMPONENT_DEFINITIONS.filter((d) => cat.types.includes(d.type));
          return (
            <div key={cat.label} className="mb-2">
              <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {cat.label}
              </p>
              {defs.map((def) => (
                <button
                  key={def.type}
                  type="button"
                  onClick={() => onAdd(def.type)}
                  className="w-full flex items-start gap-3 rounded-xl px-3 py-2.5 text-left
                             hover:bg-indigo-50 hover:shadow-sm active:scale-[0.98]
                             transition-all duration-150 group select-none mb-0.5"
                >
                  <span className="text-xl shrink-0 mt-0.5">{ICONS[def.type]}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 leading-tight">
                      {def.label}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-snug mt-0.5 truncate">
                      {def.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t bg-white">
        <p className="text-[11px] text-slate-400 text-center">
          Click a block to add it to the canvas
        </p>
      </div>
    </aside>
  );
}
