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
import { Copy, Plus } from 'lucide-react';
import { ComponentType, VibeComponent } from '@/types/vibebuilder';
import type {
  HeroSectionProps,
  TextBlockProps,
  ImageGalleryProps,
  ContactFormProps,
  TestimonialProps,
  FeaturesGridProps,
  CTABannerProps,
  NavbarProps,
  FooterProps,
} from '@/types/vibebuilder';
import { HeroSection } from '@/components/vibe/hero-section';
import { TextBlock } from '@/components/vibe/text-block';
import { ImageGallery } from '@/components/vibe/image-gallery';
import { ContactForm } from '@/components/vibe/contact-form';
import { Testimonial } from '@/components/vibe/testimonial';
import { FeaturesGrid } from '@/components/vibe/features-grid';
import { CTABanner } from '@/components/vibe/cta-banner';
import { Navbar } from '@/components/vibe/navbar';
import { Footer } from '@/components/vibe/footer';
import type { Viewport } from './editor-topbar';

// ── Component renderer ──────────────────────────────────────────────────────

function renderVibeComponent(c: VibeComponent): React.ReactNode {
  switch (c.type) {
    case ComponentType.Hero:
      return <HeroSection {...(c.props as HeroSectionProps)} />;
    case ComponentType.TextBlock:
      return <TextBlock {...(c.props as TextBlockProps)} />;
    case ComponentType.ImageGallery:
      return <ImageGallery {...(c.props as ImageGalleryProps)} />;
    case ComponentType.ContactForm:
      return <ContactForm {...(c.props as ContactFormProps)} />;
    case ComponentType.Testimonial:
      return <Testimonial {...(c.props as TestimonialProps)} />;
    case ComponentType.FeaturesGrid:
      return <FeaturesGrid {...(c.props as FeaturesGridProps)} />;
    case ComponentType.CTABanner:
      return <CTABanner {...(c.props as CTABannerProps)} />;
    case ComponentType.Navbar:
      return <Navbar {...(c.props as NavbarProps)} />;
    case ComponentType.Footer:
      return <Footer {...(c.props as FooterProps)} />;
    default:
      return null;
  }
}

const TYPE_LABELS: Record<ComponentType, string> = {
  [ComponentType.Hero]:         'Hero Section',
  [ComponentType.TextBlock]:    'Text Block',
  [ComponentType.ImageGallery]: 'Image Gallery',
  [ComponentType.ContactForm]:  'Contact Form',
  [ComponentType.Testimonial]:  'Testimonial',
  [ComponentType.FeaturesGrid]: 'Features Grid',
  [ComponentType.CTABanner]:    'CTA Banner',
  [ComponentType.Navbar]:       'Navbar',
  [ComponentType.Footer]:       'Footer',
};

const VIEWPORT_MAX: Record<Viewport, number | undefined> = {
  desktop: 1100,
  tablet:  768,
  mobile:  390,
};

// ── Sortable component wrapper ──────────────────────────────────────────────

interface SortableComponentProps {
  component: VibeComponent;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

function SortableComponent({ component, isSelected, onSelect, onRemove, onDuplicate }: SortableComponentProps) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: component.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: 'relative',
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : 'auto',
      }}
      className="group"
      onClick={onSelect}
    >
      {/* Orange label chip */}
      {isSelected && (
        <div
          style={{
            position: 'absolute', top: 0, left: 0,
            backgroundColor: '#FF6B35', color: 'white',
            fontSize: 11, fontWeight: 700, padding: '3px 8px',
            borderRadius: '0 0 6px 0', zIndex: 30, pointerEvents: 'none',
            letterSpacing: '0.03em',
          }}
        >
          {TYPE_LABELS[component.type]}
        </div>
      )}

      {/* Orange selection outline */}
      {isSelected && (
        <div style={{
          position: 'absolute', inset: 0,
          outline: '2px solid #FF6B35', outlineOffset: -2,
          zIndex: 20, pointerEvents: 'none',
        }} />
      )}

      {/* Hover outline */}
      {!isSelected && (
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            position: 'absolute', inset: 0,
            outline: '1px solid rgba(255,107,53,0.35)', outlineOffset: -1,
            zIndex: 20, pointerEvents: 'none',
          }}
        />
      )}

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        onClick={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        title="Drag to reorder"
        style={{
          position: 'absolute', top: 8, left: 8, zIndex: 25,
          backgroundColor: 'rgba(0,0,0,0.55)', color: '#ddd',
          border: 'none', borderRadius: 4, padding: '3px 5px', fontSize: 14, lineHeight: 1,
        }}
      >
        ⠿
      </button>

      {/* Duplicate button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        title="Duplicate block (Ctrl+D)"
        style={{
          position: 'absolute', top: 8, right: 44, zIndex: 25,
          backgroundColor: 'rgba(0,0,0,0.55)', color: '#ddd',
          border: 'none', borderRadius: 4, padding: '3px 6px',
          fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center',
        }}
      >
        <Copy style={{ width: 11, height: 11 }} />
      </button>

      {/* Delete button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove block (Delete)"
        style={{
          position: 'absolute', top: 8, right: 8, zIndex: 25,
          backgroundColor: 'rgba(239,68,68,0.85)', color: 'white',
          border: 'none', borderRadius: 4, padding: '3px 7px',
          fontSize: 11, fontWeight: 700, cursor: 'pointer',
        }}
      >
        ✕
      </button>

      {/* Rendered component — pointer-events off so clicks reach wrapper */}
      <div style={{ pointerEvents: 'none' }}>
        {renderVibeComponent(component)}
      </div>
    </div>
  );
}

// ── Canvas ──────────────────────────────────────────────────────────────────

interface EditorCanvasProps {
  components: VibeComponent[];
  selectedId: string | null;
  previewMode: boolean;
  viewport: Viewport;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onDuplicate: (id: string) => void;
}

export function EditorCanvas({
  components, selectedId, previewMode, viewport, onSelect, onRemove, onReorder, onDuplicate,
}: EditorCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  }

  const sorted = [...components].sort((a, b) => a.order - b.order);
  const maxWidth = VIEWPORT_MAX[viewport];

  // Preview mode: clean full-width render
  if (previewMode) {
    return (
      <div className="flex-1 overflow-y-auto bg-white">
        <div style={{ maxWidth, margin: '0 auto' }}>
          {sorted.length === 0 ? (
            <div className="flex items-center justify-center h-full" style={{ minHeight: 480 }}>
              <p className="text-slate-400 text-sm">No blocks added yet</p>
            </div>
          ) : (
            sorted.map((c) => <div key={c.id}>{renderVibeComponent(c)}</div>)
          )}
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{
        backgroundColor: '#1A1A1A',
        scrollbarWidth: 'thin', scrollbarColor: '#333 transparent',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onSelect(''); }}
    >
      <div style={{ padding: '40px 48px 80px' }}>
        <div
          style={{
            maxWidth,
            margin: '0 auto',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 0 0 1px #333333, 0 24px 64px rgba(0,0,0,0.55)',
            backgroundColor: 'white',
            minHeight: components.length === 0 ? 480 : undefined,
            transition: 'max-width 0.25s ease',
          }}
        >
          {components.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4" style={{ minHeight: 480 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', backgroundColor: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Plus style={{ width: 24, height: 24, color: '#94a3b8' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>Canvas is empty</p>
                <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                  Add blocks from the left panel to get started.
                </p>
              </div>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sorted.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                {sorted.map((component) => (
                  <SortableComponent
                    key={component.id}
                    component={component}
                    isSelected={selectedId === component.id}
                    onSelect={() => onSelect(component.id)}
                    onRemove={() => onRemove(component.id)}
                    onDuplicate={() => onDuplicate(component.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {components.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <span style={{ fontSize: 11, color: '#444' }}>Click a block in the left panel to add it below</span>
          </div>
        )}
      </div>
    </div>
  );
}
