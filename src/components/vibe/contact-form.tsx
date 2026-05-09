import { useState } from 'react';
import { ContactFormProps } from '@/types/vibebuilder';

export function ContactForm({ title, fields, submitText, webhookUrl }: ContactFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, submittedAt: new Date().toISOString() }),
        });
        setStatus('success');
      } catch (err) {
        setErrorMsg((err as Error).message || 'Submission failed. Please try again.');
        setStatus('error');
        return;
      }
    } else {
      setStatus('success');
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    padding: '10px 12px',
    fontSize: '0.875rem',
    color: '#111827',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  if (status === 'success') {
    return (
      <section style={{ width: '100%', padding: '40px 32px', maxWidth: 640, margin: '0 auto' }}>
        <div style={{
          borderRadius: 12,
          border: '1px solid #bbf7d0',
          backgroundColor: '#f0fdf4',
          color: '#166534',
          padding: '32px 24px',
          textAlign: 'center',
        }} role="alert">
          <p style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 4px' }}>Message sent!</p>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>Thank you — we&apos;ll be in touch soon.</p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ width: '100%', padding: '40px 32px', maxWidth: 640, margin: '0 auto' }}>
      {title && <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#111827' }}>{title}</h2>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
        {fields.map((field) => (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor={field.name} style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
              {field.label}
              {field.required && <span style={{ color: '#ef4444', marginLeft: 2 }} aria-hidden>*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                required={field.required}
                rows={4}
                value={values[field.name] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                style={{ ...inputStyle, resize: 'none' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; }}
                aria-required={field.required}
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                required={field.required}
                value={values[field.name] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; }}
                aria-required={field.required}
              />
            )}
          </div>
        ))}

        {status === 'error' && (
          <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: 0 }} role="alert">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          style={{
            marginTop: 8,
            alignSelf: 'flex-start',
            padding: '10px 24px',
            borderRadius: 10,
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 600,
            border: 'none',
            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
            opacity: status === 'submitting' ? 0.6 : 1,
            transition: 'opacity 0.15s, transform 0.15s',
          }}
          onMouseEnter={(e) => { if (status !== 'submitting') (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = status === 'submitting' ? '0.6' : '1'; }}
          aria-label={submitText}
        >
          {status === 'submitting' ? 'Sending…' : submitText}
        </button>
      </form>
    </section>
  );
}
