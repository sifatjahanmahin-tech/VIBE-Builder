import { ComponentType, VibeComponent, VibeComponentProps } from '@/types/vibebuilder';
import type {
  HeroSectionProps,
  TextBlockProps,
  ImageGalleryProps,
  ContactFormProps,
  TextAlignment,
} from '@/types/vibebuilder';
import { Input } from '@/components/ui-kit/input';
import { Label } from '@/components/ui-kit/label';
import { Textarea } from '@/components/ui-kit/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui-kit/select';

interface PropertyEditorProps {
  component: VibeComponent | null;
  onChange: (patch: Partial<VibeComponentProps>) => void;
}

// ---- Field helpers ----

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      {children}
    </div>
  );
}

// ---- Per-type forms ----

function HeroForm({ props, onChange }: { props: HeroSectionProps; onChange: (p: Partial<HeroSectionProps>) => void }) {
  return (
    <>
      <Field label="Heading">
        <Input value={props.heading} onChange={(e) => onChange({ heading: e.target.value })} />
      </Field>
      <Field label="Subtext">
        <Textarea
          value={props.subtext}
          rows={3}
          onChange={(e) => onChange({ subtext: e.target.value })}
        />
      </Field>
      <Field label="Background Color">
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={props.bgColor}
            onChange={(e) => onChange({ bgColor: e.target.value })}
            className="h-9 w-12 rounded border cursor-pointer p-0.5"
          />
          <Input
            value={props.bgColor}
            onChange={(e) => onChange({ bgColor: e.target.value })}
            className="flex-1 font-mono text-xs"
          />
        </div>
      </Field>
      <Field label="Image URL">
        <Input
          value={props.imageUrl}
          placeholder="https://…"
          onChange={(e) => onChange({ imageUrl: e.target.value })}
        />
      </Field>
      <Field label="CTA Button Text">
        <Input value={props.ctaText} onChange={(e) => onChange({ ctaText: e.target.value })} />
      </Field>
    </>
  );
}

function TextBlockForm({ props, onChange }: { props: TextBlockProps; onChange: (p: Partial<TextBlockProps>) => void }) {
  const alignments: TextAlignment[] = ['left', 'center', 'right', 'justify'];
  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px'];

  return (
    <>
      <Field label="Content">
        <Textarea
          value={props.content}
          rows={5}
          onChange={(e) => onChange({ content: e.target.value })}
        />
      </Field>
      <Field label="Font Size">
        <Select value={props.fontSize} onValueChange={(v) => onChange({ fontSize: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontSizes.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Text Color">
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={props.textColor}
            onChange={(e) => onChange({ textColor: e.target.value })}
            className="h-9 w-12 rounded border cursor-pointer p-0.5"
          />
          <Input
            value={props.textColor}
            onChange={(e) => onChange({ textColor: e.target.value })}
            className="flex-1 font-mono text-xs"
          />
        </div>
      </Field>
      <Field label="Alignment">
        <Select value={props.alignment} onValueChange={(v) => onChange({ alignment: v as TextAlignment })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {alignments.map((a) => (
              <SelectItem key={a} value={a}>
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </>
  );
}

function ImageGalleryForm({ props, onChange }: { props: ImageGalleryProps; onChange: (p: Partial<ImageGalleryProps>) => void }) {
  function handleImageChange(idx: number, value: string) {
    const updated = [...props.images];
    updated[idx] = value;
    onChange({ images: updated });
  }

  function addImage() {
    onChange({ images: [...props.images, ''] });
  }

  function removeImage(idx: number) {
    onChange({ images: props.images.filter((_, i) => i !== idx) });
  }

  return (
    <>
      <Field label="Images (URLs)">
        <div className="flex flex-col gap-1.5">
          {props.images.map((url, idx) => (
            <div key={idx} className="flex gap-1">
              <Input
                value={url}
                placeholder="https://…"
                onChange={(e) => handleImageChange(idx, e.target.value)}
                className="flex-1 text-xs"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="px-2 text-muted-foreground hover:text-destructive"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addImage}
            className="text-xs text-primary hover:underline text-left"
          >
            + Add image URL
          </button>
        </div>
      </Field>
      <Field label="Columns">
        <Select
          value={String(props.columns)}
          onValueChange={(v) => onChange({ columns: Number(v) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} {n === 1 ? 'column' : 'columns'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Gap (px)">
        <Input
          type="number"
          min={0}
          max={64}
          value={props.gap}
          onChange={(e) => onChange({ gap: Number(e.target.value) })}
        />
      </Field>
    </>
  );
}

function ContactFormForm({ props, onChange }: { props: ContactFormProps; onChange: (p: Partial<ContactFormProps>) => void }) {
  return (
    <>
      <Field label="Form Title">
        <Input value={props.title} onChange={(e) => onChange({ title: e.target.value })} />
      </Field>
      <Field label="Submit Button Text">
        <Input
          value={props.submitText}
          onChange={(e) => onChange({ submitText: e.target.value })}
        />
      </Field>
      <Field label="Fields">
        <p className="text-xs text-muted-foreground">
          {props.fields.length} field{props.fields.length !== 1 ? 's' : ''} configured.
        </p>
        <div className="flex flex-col gap-1 mt-1">
          {props.fields.map((f, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded border px-2 py-1 bg-muted/30">
              <span className="text-xs flex-1 truncate">{f.label}</span>
              <span className="text-xs text-muted-foreground">{f.type}</span>
              {f.required && (
                <span className="text-xs text-destructive font-medium">required</span>
              )}
            </div>
          ))}
        </div>
      </Field>
    </>
  );
}

// ---- Main panel ----

export function PropertyEditor({ component, onChange }: PropertyEditorProps) {
  if (!component) {
    return (
      <aside className="w-72 shrink-0 border-l bg-muted/30 flex items-center justify-center">
        <p className="text-sm text-muted-foreground text-center px-4">
          Select a component on the canvas to edit its properties.
        </p>
      </aside>
    );
  }

  return (
    <aside className="w-72 shrink-0 border-l bg-background overflow-y-auto">
      <div className="px-4 py-3 border-b">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Properties
        </p>
        <p className="text-sm font-medium mt-0.5 capitalize">{component.type}</p>
      </div>
      <div className="flex flex-col gap-4 p-4">
        {component.type === ComponentType.Hero && (
          <HeroForm
            props={component.props as HeroSectionProps}
            onChange={onChange as (p: Partial<HeroSectionProps>) => void}
          />
        )}
        {component.type === ComponentType.TextBlock && (
          <TextBlockForm
            props={component.props as TextBlockProps}
            onChange={onChange as (p: Partial<TextBlockProps>) => void}
          />
        )}
        {component.type === ComponentType.ImageGallery && (
          <ImageGalleryForm
            props={component.props as ImageGalleryProps}
            onChange={onChange as (p: Partial<ImageGalleryProps>) => void}
          />
        )}
        {component.type === ComponentType.ContactForm && (
          <ContactFormForm
            props={component.props as ContactFormProps}
            onChange={onChange as (p: Partial<ContactFormProps>) => void}
          />
        )}
      </div>
    </aside>
  );
}
