import { useState } from 'react';
import { ContactFormProps } from '@/types/vibebuilder';

export function ContactForm({ title, fields, submitText }: ContactFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="w-full px-8 py-10 max-w-2xl mx-auto">
        <div className="rounded-xl border bg-green-50 text-green-800 px-6 py-8 text-center">
          <p className="text-lg font-semibold">Thank you!</p>
          <p className="text-sm mt-1">Your message has been received.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-8 py-10 max-w-2xl mx-auto">
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-0.5">*</span>}
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
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          className="mt-2 self-start px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          {submitText}
        </button>
      </form>
    </section>
  );
}
