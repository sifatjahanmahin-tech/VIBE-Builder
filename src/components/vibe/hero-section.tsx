import { HeroSectionProps } from '@/types/vibebuilder';

export function HeroSection({ heading, subtext, bgColor, imageUrl, ctaText }: HeroSectionProps) {
  return (
    <section
      className="relative w-full min-h-[420px] flex items-center overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          aria-hidden
        />
      )}
      <div className="relative z-10 max-w-4xl mx-auto px-8 py-16 flex flex-col gap-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">{heading}</h1>
        {subtext && (
          <p className="text-lg md:text-xl text-white/85 max-w-2xl">{subtext}</p>
        )}
        {ctaText && (
          <div>
            <button
              type="button"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-sm font-semibold shadow-md hover:bg-white/90 transition-colors"
              style={{ color: bgColor }}
            >
              {ctaText}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
