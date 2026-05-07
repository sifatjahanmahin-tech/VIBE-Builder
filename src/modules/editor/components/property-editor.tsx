import { ComponentType, VibeComponent, VibeComponentProps } from '@/types/vibebuilder';
import type {
  HeroSectionProps,
  TextBlockProps,
  ImageGalleryProps,
  ContactFormProps,
  TestimonialProps,
  FeaturesGridProps,
  CTABannerProps,
  TextAlignment,
  FeatureItem,
} from '@/types/vibebuilder';
import { Input } from '@/components/ui-kit/input';
import { Label } from '@/components/ui-kit/label';
import { Textarea } from '@/components/ui-kit/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui-kit/select';
import { Button } from '@/components/ui-kit/button';
import { Trash2, Plus } from 'lucide-react';

interface PropertyEditorProps {
  component: VibeComponent | null;
  onChange: (patch: Partial<VibeComponentProps>) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</Label>
      {children}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-10 rounded-lg border cursor-pointer p-0.5 shrink-0"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-xs"
        />
      </div>
    </Field>
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
        <Textarea value={props.subtext} rows={3} onChange={(e) => onChange({ subtext: e.target.value })} />
      </Field>
      <Field label="CTA Button Text">
        <Input value={props.ctaText} onChange={(e) => onChange({ ctaText: e.target.value })} />
      </Field>
      <Field label="Alignment">
        <Select
          value={props.alignment ?? 'left'}
          onValueChange={(v) => onChange({ alignment: v as 'left' | 'center' | 'right' })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {(['left', 'center', 'right'] as const).map((a) => (
              <SelectItem key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <ColorField label="Background Color" value={props.bgColor} onChange={(v) => onChange({ bgColor: v })} />
      <Field label="Gradient From (optional)">
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={props.gradientFrom ?? props.bgColor}
            onChange={(e) => onChange({ gradientFrom: e.target.value })}
            className="h-9 w-10 rounded-lg border cursor-pointer p-0.5 shrink-0"
          />
          <Input
            value={props.gradientFrom ?? ''}
            placeholder="Leave empty for solid"
            onChange={(e) => onChange({ gradientFrom: e.target.value || undefined })}
            className="flex-1 font-mono text-xs"
          />
        </div>
      </Field>
      <Field label="Gradient To (optional)">
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={props.gradientTo ?? props.bgColor}
            onChange={(e) => onChange({ gradientTo: e.target.value })}
            className="h-9 w-10 rounded-lg border cursor-pointer p-0.5 shrink-0"
          />
          <Input
            value={props.gradientTo ?? ''}
            placeholder="Leave empty for solid"
            onChange={(e) => onChange({ gradientTo: e.target.value || undefined })}
            className="flex-1 font-mono text-xs"
          />
        </div>
      </Field>
      <Field label="Image URL">
        <Input value={props.imageUrl} placeholder="https://…" onChange={(e) => onChange({ imageUrl: e.target.value })} />
      </Field>
      {props.imageUrl && (
        <Field label="Image Overlay Opacity">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={props.overlayOpacity ?? 0.3}
              onChange={(e) => onChange({ overlayOpacity: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-xs text-slate-500 w-8 text-right">
              {Math.round((props.overlayOpacity ?? 0.3) * 100)}%
            </span>
          </div>
        </Field>
      )}
    </>
  );
}

function TextBlockForm({ props, onChange }: { props: TextBlockProps; onChange: (p: Partial<TextBlockProps>) => void }) {
  const alignments: TextAlignment[] = ['left', 'center', 'right', 'justify'];
  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px'];

  return (
    <>
      <Field label="Content">
        <Textarea value={props.content} rows={5} onChange={(e) => onChange({ content: e.target.value })} />
      </Field>
      <Field label="Font Size">
        <Select value={props.fontSize} onValueChange={(v) => onChange({ fontSize: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {fontSizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <ColorField label="Text Color" value={props.textColor} onChange={(v) => onChange({ textColor: v })} />
      <Field label="Alignment">
        <Select value={props.alignment} onValueChange={(v) => onChange({ alignment: v as TextAlignment })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {alignments.map((a) => (
              <SelectItem key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</SelectItem>
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
                onClick={() => onChange({ images: props.images.filter((_, i) => i !== idx) })}
                className="px-2 text-slate-400 hover:text-red-500 transition-colors"
                aria-label="Remove image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ images: [...props.images, ''] })}
            className="text-xs text-indigo-600 hover:underline text-left"
          >
            + Add image URL
          </button>
        </div>
      </Field>
      <Field label="Columns">
        <Select value={String(props.columns)} onValueChange={(v) => onChange({ columns: Number(v) })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4].map((n) => (
              <SelectItem key={n} value={String(n)}>{n} {n === 1 ? 'column' : 'columns'}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Gap (px)">
        <Input type="number" min={0} max={64} value={props.gap} onChange={(e) => onChange({ gap: Number(e.target.value) })} />
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
        <Input value={props.submitText} onChange={(e) => onChange({ submitText: e.target.value })} />
      </Field>
      <Field label="Fields">
        <p className="text-xs text-slate-400">
          {props.fields.length} field{props.fields.length !== 1 ? 's' : ''} configured.
        </p>
        <div className="flex flex-col gap-1 mt-1">
          {props.fields.map((f, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded-lg border px-2 py-1.5 bg-slate-50">
              <span className="text-xs flex-1 truncate font-medium">{f.label}</span>
              <span className="text-xs text-slate-400">{f.type}</span>
              {f.required && <span className="text-xs text-red-400 font-semibold">*</span>}
            </div>
          ))}
        </div>
      </Field>
    </>
  );
}

function TestimonialForm({ props, onChange }: { props: TestimonialProps; onChange: (p: Partial<TestimonialProps>) => void }) {
  return (
    <>
      <Field label="Quote">
        <Textarea value={props.quote} rows={4} onChange={(e) => onChange({ quote: e.target.value })} />
      </Field>
      <Field label="Author Name">
        <Input value={props.authorName} onChange={(e) => onChange({ authorName: e.target.value })} />
      </Field>
      <Field label="Author Role">
        <Input value={props.authorRole} placeholder="CEO, Company" onChange={(e) => onChange({ authorRole: e.target.value })} />
      </Field>
      <Field label="Author Image URL">
        <Input value={props.authorImage} placeholder="https://…" onChange={(e) => onChange({ authorImage: e.target.value })} />
      </Field>
      <ColorField label="Background Color" value={props.bgColor} onChange={(v) => onChange({ bgColor: v })} />
    </>
  );
}

function FeaturesGridForm({ props, onChange }: { props: FeaturesGridProps; onChange: (p: Partial<FeaturesGridProps>) => void }) {
  function updateFeature(idx: number, patch: Partial<FeatureItem>) {
    const updated = props.features.map((f, i) => (i === idx ? { ...f, ...patch } : f));
    onChange({ features: updated });
  }

  function addFeature() {
    onChange({ features: [...props.features, { icon: '✨', title: 'New Feature', description: 'Describe this feature.' }] });
  }

  function removeFeature(idx: number) {
    onChange({ features: props.features.filter((_, i) => i !== idx) });
  }

  return (
    <>
      <Field label="Section Title">
        <Input value={props.title} onChange={(e) => onChange({ title: e.target.value })} />
      </Field>
      <Field label="Features">
        <div className="flex flex-col gap-3">
          {props.features.map((f, idx) => (
            <div key={idx} className="rounded-lg border p-3 bg-slate-50 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Feature {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={f.icon}
                  onChange={(e) => updateFeature(idx, { icon: e.target.value })}
                  className="w-14 text-center text-lg"
                  maxLength={2}
                  placeholder="🌟"
                />
                <Input
                  value={f.title}
                  onChange={(e) => updateFeature(idx, { title: e.target.value })}
                  placeholder="Feature title"
                  className="flex-1"
                />
              </div>
              <Input
                value={f.description}
                onChange={(e) => updateFeature(idx, { description: e.target.value })}
                placeholder="Brief description…"
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFeature}
            className="gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Feature
          </Button>
        </div>
      </Field>
    </>
  );
}

function CTABannerForm({ props, onChange }: { props: CTABannerProps; onChange: (p: Partial<CTABannerProps>) => void }) {
  return (
    <>
      <Field label="Heading">
        <Input value={props.heading} onChange={(e) => onChange({ heading: e.target.value })} />
      </Field>
      <Field label="Subtext">
        <Textarea value={props.subtext} rows={2} onChange={(e) => onChange({ subtext: e.target.value })} />
      </Field>
      <Field label="Button Text">
        <Input value={props.buttonText} onChange={(e) => onChange({ buttonText: e.target.value })} />
      </Field>
      <Field label="Button URL">
        <Input value={props.buttonUrl} placeholder="https://…" onChange={(e) => onChange({ buttonUrl: e.target.value })} />
      </Field>
      <ColorField label="Background Color" value={props.bgColor} onChange={(v) => onChange({ bgColor: v })} />
      <ColorField label="Text Color" value={props.textColor} onChange={(v) => onChange({ textColor: v })} />
    </>
  );
}

// ---- Main panel ----

export function PropertyEditor({ component, onChange }: PropertyEditorProps) {
  if (!component) {
    return (
      <aside className="w-72 shrink-0 border-l bg-slate-50 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-white border-2 border-dashed border-slate-200 flex items-center justify-center">
          <span className="text-xl">🎨</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-600">No block selected</p>
          <p className="text-xs text-slate-400 mt-1">Click a block on the canvas to edit its properties.</p>
        </div>
      </aside>
    );
  }

  const typeLabel = component.type.replace(/([A-Z])/g, ' $1').trim();

  return (
    <aside className="w-72 shrink-0 border-l bg-white overflow-y-auto">
      <div className="px-4 py-3.5 border-b bg-slate-50">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Properties</p>
        <p className="text-sm font-semibold text-slate-800 mt-0.5">{typeLabel}</p>
      </div>
      <div className="flex flex-col gap-4 p-4">
        {component.type === ComponentType.Hero && (
          <HeroForm props={component.props as HeroSectionProps} onChange={onChange as (p: Partial<HeroSectionProps>) => void} />
        )}
        {component.type === ComponentType.TextBlock && (
          <TextBlockForm props={component.props as TextBlockProps} onChange={onChange as (p: Partial<TextBlockProps>) => void} />
        )}
        {component.type === ComponentType.ImageGallery && (
          <ImageGalleryForm props={component.props as ImageGalleryProps} onChange={onChange as (p: Partial<ImageGalleryProps>) => void} />
        )}
        {component.type === ComponentType.ContactForm && (
          <ContactFormForm props={component.props as ContactFormProps} onChange={onChange as (p: Partial<ContactFormProps>) => void} />
        )}
        {component.type === ComponentType.Testimonial && (
          <TestimonialForm props={component.props as TestimonialProps} onChange={onChange as (p: Partial<TestimonialProps>) => void} />
        )}
        {component.type === ComponentType.FeaturesGrid && (
          <FeaturesGridForm props={component.props as FeaturesGridProps} onChange={onChange as (p: Partial<FeaturesGridProps>) => void} />
        )}
        {component.type === ComponentType.CTABanner && (
          <CTABannerForm props={component.props as CTABannerProps} onChange={onChange as (p: Partial<CTABannerProps>) => void} />
        )}
      </div>
    </aside>
  );
}
