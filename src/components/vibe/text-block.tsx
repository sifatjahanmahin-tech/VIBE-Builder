import { TextBlockProps } from '@/types/vibebuilder';

export function TextBlock({ content, fontSize, textColor, alignment }: TextBlockProps) {
  return (
    <section className="w-full px-8 py-10 max-w-4xl mx-auto">
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
