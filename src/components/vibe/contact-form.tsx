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
      // no webhook configured — treat as success
      setStatus('success');
    }
  }

  if (status === 'success') {
    return (
      <section className="w-full px-8 py-10 max-w-2xl mx-auto">
        <div className="rounded-xl border bg-green-50 text-green-800 px-6 py-8 text-center" role="alert">
          <p className="text-lg font-semibold">Message sent!</p>
          <p className="text-sm mt-1">Thank you — we&apos;ll be in touch soon.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-8 py-10 max-w-2xl mx-auto">
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-0.5" aria-hidden>*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                required={field.required}
                rows={4}
                value={values[field.name] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
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
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                aria-required={field.required}
              />
            )}
          </div>
        ))}

        {status === 'error' && (
          <p className="text-sm text-red-600" role="alert">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="mt-2 self-start px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          aria-label={submitText}
        >
          {status === 'submitting' ? 'Sending…' : submitText}
        </button>
      </form>
    </section>
  );
}
