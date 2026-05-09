import { TextBlockProps } from '@/types/vibebuilder';

export function TextBlock({ content, fontSize, textColor, alignment }: TextBlockProps) {
  return (
    <section className="w-full px-8 py-16 mx-auto" style={{ maxWidth: 800 }}>
      <p
        style={{
          fontSize,
          color: textColor,
          textAlign: alignment,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.75,
        }}
      >
        {content}
      </p>
    </section>
  );
}
