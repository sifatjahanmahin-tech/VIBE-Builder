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

const TYPE_LABELS: Record<ComponentType, string> = {
  [ComponentType.Hero]: 'Hero',
  [ComponentType.TextBlock]: 'Text',
  [ComponentType.ImageGallery]: 'Gallery',
  [ComponentType.ContactForm]: 'Form',
  [ComponentType.Testimonial]: 'Quote',
  [ComponentType.FeaturesGrid]: 'Features',
  [ComponentType.CTABanner]: 'CTA',
};

const TYPE_ACCENT: Record<ComponentType, string> = {
  [ComponentType.Hero]:         '#6366f1',
  [ComponentType.TextBlock]:    '#8b5cf6',
  [ComponentType.ImageGallery]: '#f59e0b',
  [ComponentType.ContactForm]:  '#10b981',
  [ComponentType.Testimonial]:  '#ec4899',
  [ComponentType.FeaturesGrid]: '#06b6d4',
  [ComponentType.CTABanner]:    '#FF6B35',
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
    case ComponentType.ContactForm:  return String(p.title ?? '');
    case ComponentType.Testimonial:  return String(p.authorName ?? '');
    case ComponentType.FeaturesGrid: return String(p.title ?? '');
    case ComponentType.CTABanner:    return String(p.heading ?? '');
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

  const accent = TYPE_ACCENT[component.type];

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        backgroundColor: isSelected ? '#1E1E1E' : '#181818',
        border: `1px solid ${isSelected ? accent : '#2A2A2A'}`,
        borderLeft: `3px solid ${accent}`,
        boxShadow: isSelected ? `0 0 0 1px ${accent}33` : 'none',
      }}
      onClick={onSelect}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-150 group"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="cursor-grab active:cursor-grabbing p-0.5 shrink-0 transition-colors"
        style={{ color: '#444' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#888'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#444'; }}
        onClick={(e) => e.stopPropagation()}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Type badge */}
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
        style={{ backgroundColor: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}
      >
        {TYPE_LABELS[component.type]}
      </span>

      {/* Preview text */}
      <span className="text-sm truncate flex-1" style={{ color: '#888888' }}>
        {getPreviewText(component)}
      </span>

      {/* Delete */}
      <button
        type="button"
        className="h-6 w-6 shrink-0 flex items-center justify-center rounded transition-all opacity-0 group-hover:opacity-100"
        style={{ color: '#555' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = '#ef444415'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        title="Remove block"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

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
    <div
      className="flex-1 overflow-y-auto p-6"
      style={{
        backgroundColor: '#1E1E1E',
        scrollbarWidth: 'thin',
        scrollbarColor: '#2A2A2A transparent',
      }}
    >
      <div className="max-w-2xl mx-auto">
        {components.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center min-h-[320px] rounded-xl text-center gap-4 p-8"
            style={{ border: '2px dashed #2A2A2A' }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#252525' }}
            >
              <span className="text-2xl">🧱</span>
            </div>
            <div>
              <p className="text-base font-semibold text-white">Canvas is empty</p>
              <p className="text-sm mt-1" style={{ color: '#555' }}>
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
              <div className="flex flex-col gap-1.5">
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
