import { Image, Layout, Mail, Type } from 'lucide-react';
import { ComponentType, COMPONENT_DEFINITIONS } from '@/types/vibebuilder';

const ICONS: Record<ComponentType, React.ReactNode> = {
  [ComponentType.Hero]: <Layout className="h-5 w-5" />,
  [ComponentType.TextBlock]: <Type className="h-5 w-5" />,
  [ComponentType.ImageGallery]: <Image className="h-5 w-5" />,
  [ComponentType.ContactForm]: <Mail className="h-5 w-5" />,
};

interface ComponentPaletteProps {
  onAdd: (type: ComponentType) => void;
}

export function ComponentPalette({ onAdd }: ComponentPaletteProps) {
  return (
    <aside className="w-56 shrink-0 border-r bg-muted/30 flex flex-col overflow-y-auto">
      <div className="px-4 py-3 border-b">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Components
        </p>
      </div>
      <ul className="flex flex-col gap-1 p-2">
        {COMPONENT_DEFINITIONS.map((def) => (
          <li key={def.type}>
            <button
              type="button"
              onClick={() => onAdd(def.type)}
              className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-left
                         hover:bg-primary/10 hover:text-primary transition-colors
                         active:scale-95 select-none"
            >
              <span className="text-muted-foreground">{ICONS[def.type]}</span>
              {def.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-auto px-4 py-3 border-t">
        <p className="text-xs text-muted-foreground">Click a component to add it to the canvas.</p>
      </div>
    </aside>
  );
}
