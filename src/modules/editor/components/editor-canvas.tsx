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

// ---- Sortable item ----

interface SortableItemProps {
  component: VibeComponent;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

const TYPE_LABELS: Record<ComponentType, string> = {
  [ComponentType.Hero]: 'Hero Section',
  [ComponentType.TextBlock]: 'Text Block',
  [ComponentType.ImageGallery]: 'Image Gallery',
  [ComponentType.ContactForm]: 'Contact Form',
};

const TYPE_COLORS: Record<ComponentType, string> = {
  [ComponentType.Hero]: 'bg-blue-100 text-blue-700 border-blue-200',
  [ComponentType.TextBlock]: 'bg-violet-100 text-violet-700 border-violet-200',
  [ComponentType.ImageGallery]: 'bg-amber-100 text-amber-700 border-amber-200',
  [ComponentType.ContactForm]: 'bg-green-100 text-green-700 border-green-200',
};

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
        'flex items-center gap-3 rounded-lg border-2 px-4 py-3 cursor-pointer transition-all',
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-background hover:border-primary/40 hover:bg-muted/40'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-0.5 shrink-0"
        onClick={(e) => e.stopPropagation()}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Label */}
      <span
        className={cn(
          'text-xs font-semibold px-2 py-0.5 rounded border',
          TYPE_COLORS[component.type]
        )}
      >
        {TYPE_LABELS[component.type]}
      </span>

      {/* Preview text */}
      <span className="text-sm text-muted-foreground truncate flex-1">
        {getPreviewText(component)}
      </span>

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        title="Remove component"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function getPreviewText(c: VibeComponent): string {
  const p = (c.props as unknown) as Record<string, unknown>;
  if (c.type === ComponentType.Hero) return String(p.heading ?? '');
  if (c.type === ComponentType.TextBlock) {
    const content = String(p.content ?? '');
    return content.length > 60 ? content.slice(0, 60) + '…' : content;
  }
  if (c.type === ComponentType.ImageGallery) {
    const imgs = (p.images as string[]) ?? [];
    return `${imgs.length} image${imgs.length !== 1 ? 's' : ''}`;
  }
  if (c.type === ComponentType.ContactForm) return String(p.title ?? '');
  return '';
}

// ---- Canvas ----

interface EditorCanvasProps {
  components: VibeComponent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
}

export function EditorCanvas({
  components,
  selectedId,
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

  return (
    <div className="flex-1 overflow-y-auto bg-muted/20 p-6">
      <div className="max-w-2xl mx-auto">
        {components.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed border-border text-center gap-2">
            <p className="text-base font-medium text-muted-foreground">Canvas is empty</p>
            <p className="text-sm text-muted-foreground">
              Click a component in the left panel to add it.
            </p>
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
