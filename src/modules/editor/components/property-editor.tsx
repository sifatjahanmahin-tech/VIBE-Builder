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
import { Trash2, Plus, SlidersHorizontal } from 'lucide-react';

interface PropertyEditorProps {
  component: VibeComponent | null;
  onChange: (patch: Partial<VibeComponentProps>) => void;
}

// ---- Dark-themed field components ----

const inputStyle: React.CSSProperties = {
  backgroundColor: '#1A1A1A',
  border: '1px solid #2A2A2A',
  color: '#FFFFFF',
  borderRadius: 6,
  padding: '7px 10px',
  fontSize: 12,
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#666666',
  marginBottom: 6,
  display: 'block',
};

function DField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function DInput({ value, onChange, placeholder, type = 'text' }: {
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
      onBlur={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; }}
    />
  );
}

function DTextarea({ value, onChange, rows = 3 }: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; }}
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
      onBlur={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ backgroundColor: '#1A1A1A' }}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function DColorField({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <DField label={label}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 36, height: 34, borderRadius: 6, border: '1px solid #2A2A2A',
            cursor: 'pointer', padding: 2, backgroundColor: '#1A1A1A', flexShrink: 0,
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 11 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; }}
        />
      </div>
    </DField>
  );
}

// ---- Section wrapper with collapsible header ----

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: '1px solid #222222', paddingBottom: 16, marginBottom: 4 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555555', marginBottom: 12 }}>
        {title}
      </p>
      {children}
    </div>
  );
}

// ---- Per-type forms ----

function HeroForm({ props, onChange }: { props: HeroSectionProps; onChange: (p: Partial<HeroSectionProps>) => void }) {
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
            <input
              type="color"
              value={props.gradientFrom ?? props.bgColor}
              onChange={(e) => onChange({ gradientFrom: e.target.value })}
              style={{ width: 36, height: 34, borderRadius: 6, border: '1px solid #2A2A2A', cursor: 'pointer', padding: 2, backgroundColor: '#1A1A1A', flexShrink: 0 }}
            />
            <input
              type="text"
              value={props.gradientFrom ?? ''}
              placeholder="Leave empty for solid"
              onChange={(e) => onChange({ gradientFrom: e.target.value || undefined })}
              style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 11 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; }}
            />
          </div>
        </DField>
        <DField label="Gradient To (optional)">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="color"
              value={props.gradientTo ?? props.bgColor}
              onChange={(e) => onChange({ gradientTo: e.target.value })}
              style={{ width: 36, height: 34, borderRadius: 6, border: '1px solid #2A2A2A', cursor: 'pointer', padding: 2, backgroundColor: '#1A1A1A', flexShrink: 0 }}
            />
            <input
              type="text"
              value={props.gradientTo ?? ''}
              placeholder="Leave empty for solid"
              onChange={(e) => onChange({ gradientTo: e.target.value || undefined })}
              style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 11 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; }}
            />
          </div>
        </DField>
        <DField label="Background Image URL">
          <DInput value={props.imageUrl} placeholder="https://…" onChange={(v) => onChange({ imageUrl: v })} />
        </DField>
        {props.imageUrl && (
          <DField label="Image Overlay Opacity">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="range"
                min={0} max={1} step={0.05}
                value={props.overlayOpacity ?? 0.3}
                onChange={(e) => onChange({ overlayOpacity: Number(e.target.value) })}
                style={{ flex: 1, accentColor: '#FF6B35' }}
              />
              <span style={{ fontSize: 11, color: '#888', width: 30, textAlign: 'right' }}>
                {Math.round((props.overlayOpacity ?? 0.3) * 100)}%
              </span>
            </div>
          </DField>
        )}
      </Section>
    </>
  );
}

function TextBlockForm({ props, onChange }: { props: TextBlockProps; onChange: (p: Partial<TextBlockProps>) => void }) {
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

function ImageGalleryForm({ props, onChange }: { props: ImageGalleryProps; onChange: (p: Partial<ImageGalleryProps>) => void }) {
  function handleImageChange(idx: number, value: string) {
    const updated = [...props.images];
    updated[idx] = value;
    onChange({ images: updated });
  }

  return (
    <>
      <Section title="Images">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {props.images.map((url, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                value={url}
                placeholder="https://…"
                onChange={(e) => handleImageChange(idx, e.target.value)}
                style={{ ...inputStyle, fontSize: 11 }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; }}
              />
              <button
                type="button"
                onClick={() => onChange({ images: props.images.filter((_, i) => i !== idx) })}
                style={{ color: '#555', padding: '0 6px', flexShrink: 0 }}
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
            style={{ fontSize: 11, color: '#FF6B35', textAlign: 'left', marginTop: 2 }}
          >
            + Add image URL
          </button>
        </div>
      </Section>
      <Section title="Layout">
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

function ContactFormForm({ props, onChange }: { props: ContactFormProps; onChange: (p: Partial<ContactFormProps>) => void }) {
  return (
    <>
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
                  backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A',
                  borderRadius: 6, padding: '6px 10px',
                }}
              >
                <span style={{ fontSize: 12, color: '#fff', flex: 1 }}>{f.label}</span>
                <span style={{ fontSize: 10, color: '#666' }}>{f.type}</span>
                {f.required && <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 700 }}>*</span>}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 10, color: '#555', marginTop: 6 }}>Field editing coming soon.</p>
        </DField>
      </Section>
    </>
  );
}

function TestimonialForm({ props, onChange }: { props: TestimonialProps; onChange: (p: Partial<TestimonialProps>) => void }) {
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
          <DInput value={props.authorImage} placeholder="https://…" onChange={(v) => onChange({ authorImage: v })} />
        </DField>
        <DColorField label="Background Color" value={props.bgColor} onChange={(v) => onChange({ bgColor: v })} />
      </Section>
    </>
  );
}

function FeaturesGridForm({ props, onChange }: { props: FeaturesGridProps; onChange: (p: Partial<FeaturesGridProps>) => void }) {
  function updateFeature(idx: number, patch: Partial<FeatureItem>) {
    const updated = props.features.map((f, i) => (i === idx ? { ...f, ...patch } : f));
    onChange({ features: updated });
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
              style={{
                backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A',
                borderRadius: 8, padding: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Feature {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onChange({ features: props.features.filter((_, i) => i !== idx) })}
                  style={{ color: '#555' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; }}
                >
                  <Trash2 style={{ width: 12, height: 12 }} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input
                  type="text"
                  value={f.icon}
                  onChange={(e) => updateFeature(idx, { icon: e.target.value })}
                  style={{ ...inputStyle, width: 48, textAlign: 'center', fontSize: 16 }}
                  maxLength={2}
                  placeholder="🌟"
                />
                <input
                  type="text"
                  value={f.title}
                  onChange={(e) => updateFeature(idx, { title: e.target.value })}
                  placeholder="Feature title"
                  style={{ ...inputStyle }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; }}
                />
              </div>
              <input
                type="text"
                value={f.description}
                onChange={(e) => updateFeature(idx, { description: e.target.value })}
                placeholder="Brief description…"
                style={{ ...inputStyle, fontSize: 11 }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; }}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ features: [...props.features, { icon: '✨', title: 'New Feature', description: 'Describe this feature.' }] })}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, color: '#FF6B35', padding: '6px 10px',
              backgroundColor: '#FF6B3515', border: '1px solid #FF6B3530',
              borderRadius: 6, cursor: 'pointer', width: '100%',
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

function CTABannerForm({ props, onChange }: { props: CTABannerProps; onChange: (p: Partial<CTABannerProps>) => void }) {
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
      <Section title="Colors">
        <DColorField label="Background Color" value={props.bgColor} onChange={(v) => onChange({ bgColor: v })} />
        <DColorField label="Text Color" value={props.textColor} onChange={(v) => onChange({ textColor: v })} />
      </Section>
    </>
  );
}

// ---- Main panel ----

export function PropertyEditor({ component, onChange }: PropertyEditorProps) {
  if (!component) {
    return (
      <aside
        className="shrink-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
        style={{ width: 280, backgroundColor: '#141414', borderLeft: '1px solid #2A2A2A' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#1E1E1E', border: '2px dashed #2A2A2A' }}
        >
          <SlidersHorizontal className="h-5 w-5" style={{ color: '#444' }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">No block selected</p>
          <p className="text-xs mt-1" style={{ color: '#555' }}>
            Click a block on the canvas to edit its properties.
          </p>
        </div>
      </aside>
    );
  }

  const typeLabel = component.type.replace(/([A-Z])/g, ' $1').trim();

  return (
    <aside
      className="shrink-0 overflow-y-auto flex flex-col"
      style={{
        width: 280,
        backgroundColor: '#141414',
        borderLeft: '1px solid #2A2A2A',
        scrollbarWidth: 'thin',
        scrollbarColor: '#2A2A2A transparent',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid #2A2A2A' }}
      >
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555' }}>
          Properties
        </p>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginTop: 2 }}>{typeLabel}</p>
      </div>

      {/* Form */}
      <div className="flex-1 p-4">
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
