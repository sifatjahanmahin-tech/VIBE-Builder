import { useRef, useState } from 'react';
import { ChevronRight, SlidersHorizontal, Trash2, Plus, Upload, Loader2 } from 'lucide-react';
import { uploadImageFile } from '@/lib/blocks-api';
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

interface PropertyEditorProps {
  component: VibeComponent | null;
  onChange: (patch: Partial<VibeComponentProps>) => void;
}

// ── Design tokens ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#333',
  border: '1px solid #444',
  color: 'white',
  borderRadius: 6,
  padding: '7px 10px',
  fontSize: 12,
  outline: 'none',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#888',
  display: 'block',
  marginBottom: 5,
};

// ── Shared field primitives ──────────────────────────────────────────────────

function DLabel({ children }: { children: React.ReactNode }) {
  return <label style={labelStyle}>{children}</label>;
}

function DInput({
  value, onChange, placeholder, type = 'text',
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = '#444'; }}
    />
  );
}

function DTextarea({ value, onChange, rows = 3 }: {
  value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = '#444'; }}
    />
  );
}

function DSelect({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, cursor: 'pointer' }}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = '#444'; }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ backgroundColor: '#222' }}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function DColorField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <DLabel>{label}</DLabel>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 32, height: 32, padding: 2, cursor: 'pointer',
            backgroundColor: '#333', border: '1px solid #444', borderRadius: 6, flexShrink: 0,
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 11 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#444'; }}
        />
      </div>
    </div>
  );
}

function DField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <DLabel>{label}</DLabel>
      {children}
    </div>
  );
}

// ── Image upload input ───────────────────────────────────────────────────────

function ImageUploadInput({
  value, onChange, placeholder,
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadImageFile(file);
      onChange(url);
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'https://…'}
          style={{ ...inputStyle, flex: 1 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#444'; }}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          title={uploading ? 'Uploading…' : 'Upload image'}
          style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 6,
            backgroundColor: '#333', border: '1px solid #444',
            color: uploading ? '#666' : '#CCC',
            cursor: uploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            if (!uploading) {
              e.currentTarget.style.borderColor = '#FF6B35';
              e.currentTarget.style.color = '#FF6B35';
            }
          }}
          onMouseLeave={(e) => {
            if (!uploading) {
              e.currentTarget.style.borderColor = '#444';
              e.currentTarget.style.color = '#CCC';
            }
          }}
        >
          {uploading
            ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
            : <Upload style={{ width: 13, height: 13 }} />
          }
        </button>
      </div>
      {uploadError && (
        <p style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>{uploadError}</p>
      )}
    </div>
  );
}

// ── Collapsible Section ──────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ marginBottom: 2 }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', backgroundColor: '#1A1A1A',
          border: 'none', cursor: 'pointer', borderBottom: '1px solid #2A2A2A',
        }}
      >
        <ChevronRight
          style={{
            width: 12, height: 12, color: '#666',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s', flexShrink: 0,
          }}
        />
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#888',
        }}>
          {title}
        </span>
      </button>

      {open && (
        <div style={{ padding: '12px 16px', backgroundColor: '#262626', borderBottom: '1px solid #2A2A2A' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Per-type forms ───────────────────────────────────────────────────────────

function HeroForm({ props, onChange }: {
  props: HeroSectionProps;
  onChange: (p: Partial<HeroSectionProps>) => void;
}) {
  return (
    <>
      <Section title="Content">
        <DField label="Heading">
          <DInput value={props.heading} onChange={(v) => onChange({ heading: v })} />
        </DField>
        <DField label="Subtext">
          <DTextarea value={props.subtext} rows={3} onChange={(v) => onChange({ subtext: v })} />
        </DField>
        <DField label="CTA Button Text">
          <DInput value={props.ctaText} onChange={(v) => onChange({ ctaText: v })} />
        </DField>
      </Section>
      <Section title="Appearance">
        <DField label="Alignment">
          <DSelect
            value={props.alignment ?? 'left'}
            onChange={(v) => onChange({ alignment: v as 'left' | 'center' | 'right' })}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ]}
          />
        </DField>
        <DColorField label="Background Color" value={props.bgColor} onChange={(v) => onChange({ bgColor: v })} />
        <DField label="Gradient From (optional)">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color"
              value={props.gradientFrom ?? props.bgColor}
              onChange={(e) => onChange({ gradientFrom: e.target.value })}
              style={{ width: 32, height: 32, padding: 2, cursor: 'pointer', backgroundColor: '#333', border: '1px solid #444', borderRadius: 6, flexShrink: 0 }} />
            <input type="text"
              value={props.gradientFrom ?? ''}
              placeholder="empty = solid color"
              onChange={(e) => onChange({ gradientFrom: e.target.value || undefined })}
              style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 11 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#444'; }} />
          </div>
        </DField>
        <DField label="Gradient To (optional)">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color"
              value={props.gradientTo ?? props.bgColor}
              onChange={(e) => onChange({ gradientTo: e.target.value })}
              style={{ width: 32, height: 32, padding: 2, cursor: 'pointer', backgroundColor: '#333', border: '1px solid #444', borderRadius: 6, flexShrink: 0 }} />
            <input type="text"
              value={props.gradientTo ?? ''}
              placeholder="empty = solid color"
              onChange={(e) => onChange({ gradientTo: e.target.value || undefined })}
              style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 11 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#444'; }} />
          </div>
        </DField>
        <DField label="Background Image URL">
          <ImageUploadInput value={props.imageUrl} onChange={(v) => onChange({ imageUrl: v })} />
        </DField>
        {props.imageUrl && (
          <DField label="Image Overlay Opacity">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="range" min={0} max={1} step={0.05}
                value={props.overlayOpacity ?? 0.3}
                onChange={(e) => onChange({ overlayOpacity: Number(e.target.value) })}
                style={{ flex: 1, accentColor: '#FF6B35' }}
              />
              <span style={{ fontSize: 11, color: '#888', width: 32, textAlign: 'right' }}>
                {Math.round((props.overlayOpacity ?? 0.3) * 100)}%
              </span>
            </div>
          </DField>
        )}
      </Section>
    </>
  );
}

function TextBlockForm({ props, onChange }: {
  props: TextBlockProps; onChange: (p: Partial<TextBlockProps>) => void;
}) {
  return (
    <>
      <Section title="Content">
        <DField label="Content">
          <DTextarea value={props.content} rows={5} onChange={(v) => onChange({ content: v })} />
        </DField>
      </Section>
      <Section title="Typography">
        <DField label="Font Size">
          <DSelect
            value={props.fontSize}
            onChange={(v) => onChange({ fontSize: v })}
            options={['12px','14px','16px','18px','20px','24px','30px','36px','48px'].map((s) => ({ value: s, label: s }))}
          />
        </DField>
        <DColorField label="Text Color" value={props.textColor} onChange={(v) => onChange({ textColor: v })} />
        <DField label="Alignment">
          <DSelect
            value={props.alignment}
            onChange={(v) => onChange({ alignment: v as TextAlignment })}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
              { value: 'justify', label: 'Justify' },
            ]}
          />
        </DField>
      </Section>
    </>
  );
}

function ImageGalleryForm({ props, onChange }: {
  props: ImageGalleryProps; onChange: (p: Partial<ImageGalleryProps>) => void;
}) {
  return (
    <>
      <Section title="Images">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {props.images.map((url, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <ImageUploadInput
                  value={url}
                  onChange={(newUrl) => {
                    const updated = [...props.images];
                    updated[idx] = newUrl;
                    onChange({ images: updated });
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => onChange({ images: props.images.filter((_, i) => i !== idx) })}
                style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', flexShrink: 0, marginTop: 6 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; }}
              >
                <Trash2 style={{ width: 13, height: 13 }} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ images: [...props.images, ''] })}
            style={{ fontSize: 11, color: '#FF6B35', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
          >
            + Add image URL
          </button>
        </div>
      </Section>
      <Section title="Layout" defaultOpen={false}>
        <DField label="Columns">
          <DSelect
            value={String(props.columns)}
            onChange={(v) => onChange({ columns: Number(v) })}
            options={[1,2,3,4].map((n) => ({ value: String(n), label: `${n} ${n === 1 ? 'column' : 'columns'}` }))}
          />
        </DField>
        <DField label="Gap (px)">
          <DInput type="number" value={props.gap} onChange={(v) => onChange({ gap: Number(v) })} />
        </DField>
      </Section>
    </>
  );
}

function ContactFormForm({ props, onChange }: {
  props: ContactFormProps; onChange: (p: Partial<ContactFormProps>) => void;
}) {
  return (
    <Section title="Form">
      <DField label="Form Title">
        <DInput value={props.title} onChange={(v) => onChange({ title: v })} />
      </DField>
      <DField label="Submit Button Text">
        <DInput value={props.submitText} onChange={(v) => onChange({ submitText: v })} />
      </DField>
      <DField label="Fields">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {props.fields.map((f, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                backgroundColor: '#333', border: '1px solid #444',
                borderRadius: 6, padding: '6px 10px',
              }}
            >
              <span style={{ fontSize: 12, color: '#fff', flex: 1 }}>{f.label}</span>
              <span style={{ fontSize: 10, color: '#666' }}>{f.type}</span>
              {f.required && <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 700 }}>*</span>}
            </div>
          ))}
        </div>
      </DField>
    </Section>
  );
}

function TestimonialForm({ props, onChange }: {
  props: TestimonialProps; onChange: (p: Partial<TestimonialProps>) => void;
}) {
  return (
    <>
      <Section title="Quote">
        <DField label="Quote Text">
          <DTextarea value={props.quote} rows={4} onChange={(v) => onChange({ quote: v })} />
        </DField>
      </Section>
      <Section title="Author">
        <DField label="Author Name">
          <DInput value={props.authorName} onChange={(v) => onChange({ authorName: v })} />
        </DField>
        <DField label="Author Role">
          <DInput value={props.authorRole} placeholder="CEO, Company" onChange={(v) => onChange({ authorRole: v })} />
        </DField>
        <DField label="Author Image URL">
          <ImageUploadInput value={props.authorImage} onChange={(v) => onChange({ authorImage: v })} />
        </DField>
        <DColorField label="Background Color" value={props.bgColor} onChange={(v) => onChange({ bgColor: v })} />
      </Section>
    </>
  );
}

function FeaturesGridForm({ props, onChange }: {
  props: FeaturesGridProps; onChange: (p: Partial<FeaturesGridProps>) => void;
}) {
  function updateFeature(idx: number, patch: Partial<FeatureItem>) {
    onChange({ features: props.features.map((f, i) => (i === idx ? { ...f, ...patch } : f)) });
  }

  return (
    <>
      <Section title="Section">
        <DField label="Section Title">
          <DInput value={props.title} onChange={(v) => onChange({ title: v })} />
        </DField>
      </Section>
      <Section title="Features">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {props.features.map((f, idx) => (
            <div
              key={idx}
              style={{ backgroundColor: '#333', border: '1px solid #3A3A3A', borderRadius: 8, padding: 10 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Feature {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onChange({ features: props.features.filter((_, i) => i !== idx) })}
                  style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; }}
                >
                  <Trash2 style={{ width: 12, height: 12 }} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input
                  type="text" value={f.icon} maxLength={2}
                  onChange={(e) => updateFeature(idx, { icon: e.target.value })}
                  style={{ ...inputStyle, width: 44, textAlign: 'center', fontSize: 16 }}
                />
                <input
                  type="text" value={f.title} placeholder="Feature title"
                  onChange={(e) => updateFeature(idx, { title: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#444'; }}
                />
              </div>
              <input
                type="text" value={f.description} placeholder="Brief description…"
                onChange={(e) => updateFeature(idx, { description: e.target.value })}
                style={{ ...inputStyle, fontSize: 11 }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#444'; }}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ features: [...props.features, { icon: '✨', title: 'New Feature', description: 'Describe this feature.' }] })}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, width: '100%',
              padding: '7px 10px', backgroundColor: '#FF6B3515',
              border: '1px solid #FF6B3530', borderRadius: 6,
              fontSize: 11, color: '#FF6B35', cursor: 'pointer', fontWeight: 600,
            }}
          >
            <Plus style={{ width: 12, height: 12 }} />
            Add Feature
          </button>
        </div>
      </Section>
    </>
  );
}

function CTABannerForm({ props, onChange }: {
  props: CTABannerProps; onChange: (p: Partial<CTABannerProps>) => void;
}) {
  return (
    <>
      <Section title="Content">
        <DField label="Heading">
          <DInput value={props.heading} onChange={(v) => onChange({ heading: v })} />
        </DField>
        <DField label="Subtext">
          <DTextarea value={props.subtext} rows={2} onChange={(v) => onChange({ subtext: v })} />
        </DField>
        <DField label="Button Text">
          <DInput value={props.buttonText} onChange={(v) => onChange({ buttonText: v })} />
        </DField>
        <DField label="Button URL">
          <DInput value={props.buttonUrl} placeholder="https://…" onChange={(v) => onChange({ buttonUrl: v })} />
        </DField>
      </Section>
      <Section title="Colors" defaultOpen={false}>
        <DColorField label="Background Color" value={props.bgColor} onChange={(v) => onChange({ bgColor: v })} />
        <DColorField label="Text Color" value={props.textColor} onChange={(v) => onChange({ textColor: v })} />
      </Section>
    </>
  );
}

// ── Main panel ───────────────────────────────────────────────────────────────

export function PropertyEditor({ component, onChange }: PropertyEditorProps) {
  const typeLabel = component?.type.replace(/([A-Z])/g, ' $1').trim() ?? '';

  if (!component) {
    return (
      <aside
        className="shrink-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
        style={{ width: 280, backgroundColor: '#262626', borderLeft: '1px solid #2A2A2A' }}
      >
        <div
          style={{
            width: 48, height: 48, borderRadius: '50%',
            backgroundColor: '#333',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px dashed #3A3A3A',
          }}
        >
          <SlidersHorizontal style={{ width: 20, height: 20, color: '#555' }} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>No block selected</p>
          <p style={{ fontSize: 11, color: '#555', marginTop: 4, lineHeight: 1.4 }}>
            Click a block on the canvas to edit its properties.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="shrink-0 flex flex-col overflow-hidden"
      style={{
        width: 280, backgroundColor: '#262626',
        borderLeft: '1px solid #2A2A2A',
        overflowY: 'auto',
        scrollbarWidth: 'thin', scrollbarColor: '#333 transparent',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 16px', backgroundColor: '#1A1A1A',
          borderBottom: '1px solid #2A2A2A', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555' }}>
            Properties
          </p>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'white', marginTop: 1 }}>
            {typeLabel}
          </p>
        </div>
      </div>

      {/* Form sections */}
      <div className="flex-1" style={{ overflowY: 'auto' }}>
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
