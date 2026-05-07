import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { cn } from '@/lib/utils';
import { ComponentType, VibeComponent } from '@/types/vibebuilder';
import type {
  HeroSectionProps,
  TextBlockProps,
  ImageGalleryProps,
  ContactFormProps,
  TestimonialProps,
  FeaturesGridProps,
  CTABannerProps,
} from '@/types/vibebuilder';
import { HeroSection } from '@/components/vibe/hero-section';
import { TextBlock } from '@/components/vibe/text-block';
import { ImageGallery } from '@/components/vibe/image-gallery';
import { ContactForm } from '@/components/vibe/contact-form';
import { Testimonial } from '@/components/vibe/testimonial';
import { FeaturesGrid } from '@/components/vibe/features-grid';
import { CTABanner } from '@/components/vibe/cta-banner';

// ---- Shared renderer (used in preview mode) ----

function renderVibeComponent(c: VibeComponent) {
  switch (c.type) {
    case ComponentType.Hero:
      return <HeroSection key={c.id} {...(c.props as HeroSectionProps)} />;
    case ComponentType.TextBlock:
      return <TextBlock key={c.id} {...(c.props as TextBlockProps)} />;
    case ComponentType.ImageGallery:
      return <ImageGallery key={c.id} {...(c.props as ImageGalleryProps)} />;
    case ComponentType.ContactForm:
      return <ContactForm key={c.id} {...(c.props as ContactFormProps)} />;
    case ComponentType.Testimonial:
      return <Testimonial key={c.id} {...(c.props as TestimonialProps)} />;
    case ComponentType.FeaturesGrid:
      return <FeaturesGrid key={c.id} {...(c.props as FeaturesGridProps)} />;
    case ComponentType.CTABanner:
      return <CTABanner key={c.id} {...(c.props as CTABannerProps)} />;
    default:
      return null;
  }
}

// ---- Sortable item ----

const TYPE_LABELS: Record<ComponentType, string> = {
  [ComponentType.Hero]: 'Hero',
  [ComponentType.TextBlock]: 'Text',
  [ComponentType.ImageGallery]: 'Gallery',
  [ComponentType.ContactForm]: 'Form',
  [ComponentType.Testimonial]: 'Testimonial',
  [ComponentType.FeaturesGrid]: 'Features',
  [ComponentType.CTABanner]: 'CTA',
};

const TYPE_COLORS: Record<ComponentType, string> = {
  [ComponentType.Hero]: 'bg-blue-100 text-blue-700 border-blue-200',
  [ComponentType.TextBlock]: 'bg-violet-100 text-violet-700 border-violet-200',
  [ComponentType.ImageGallery]: 'bg-amber-100 text-amber-700 border-amber-200',
  [ComponentType.ContactForm]: 'bg-green-100 text-green-700 border-green-200',
  [ComponentType.Testimonial]: 'bg-rose-100 text-rose-700 border-rose-200',
  [ComponentType.FeaturesGrid]: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  [ComponentType.CTABanner]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

function getPreviewText(c: VibeComponent): string {
  const p = (c.props as unknown) as Record<string, unknown>;
  switch (c.type) {
    case ComponentType.Hero: return String(p.heading ?? '');
    case ComponentType.TextBlock: {
      const content = String(p.content ?? '');
      return content.length > 60 ? content.slice(0, 60) + '…' : content;
    }
    case ComponentType.ImageGallery: {
      const imgs = (p.images as string[]) ?? [];
      return `${imgs.length} image${imgs.length !== 1 ? 's' : ''}`;
    }
    case ComponentType.ContactForm: return String(p.title ?? '');
    case ComponentType.Testimonial: return String(p.authorName ?? '');
    case ComponentType.FeaturesGrid: return String(p.title ?? '');
    case ComponentType.CTABanner: return String(p.heading ?? '');
    default: return '';
  }
}

interface SortableItemProps {
  component: VibeComponent;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

function SortableItem({ component, isSelected, onSelect, onRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        'flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all duration-150 group',
        isSelected
          ? 'border-indigo-400 bg-indigo-50 shadow-md shadow-indigo-100'
          : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 p-0.5 shrink-0 transition-colors"
        onClick={(e) => e.stopPropagation()}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Type badge */}
      <span
        className={cn(
          'text-xs font-bold px-2 py-0.5 rounded-full border shrink-0',
          TYPE_COLORS[component.type]
        )}
      >
        {TYPE_LABELS[component.type]}
      </span>

      {/* Preview text */}
      <span className="text-sm text-slate-500 truncate flex-1">{getPreviewText(component)}</span>

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        title="Remove block"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ---- Canvas ----

interface EditorCanvasProps {
  components: VibeComponent[];
  selectedId: string | null;
  previewMode: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
}

export function EditorCanvas({
  components,
  selectedId,
  previewMode,
  onSelect,
  onRemove,
  onReorder,
}: EditorCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  }

  // Preview mode: render actual components
  if (previewMode) {
    return (
      <div className="flex-1 overflow-y-auto bg-white">
        {components.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <p className="text-slate-400 text-sm">No blocks added yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {[...components].sort((a, b) => a.order - b.order).map(renderVibeComponent)}
          </div>
        )}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="flex-1 overflow-y-auto bg-slate-100/70 p-6">
      <div className="max-w-2xl mx-auto">
        {components.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[320px] rounded-2xl border-2 border-dashed border-slate-300 bg-white text-center gap-3 p-8">
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
              <span className="text-2xl">🧱</span>
            </div>
            <div>
              <p className="text-base font-semibold text-slate-700">Canvas is empty</p>
              <p className="text-sm text-slate-400 mt-1">
                Pick a block from the left panel to get started.
              </p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={components.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2">
                {components.map((component) => (
                  <SortableItem
                    key={component.id}
                    component={component}
                    isSelected={selectedId === component.id}
                    onSelect={() => onSelect(component.id)}
                    onRemove={() => onRemove(component.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
