import { HeroSectionProps } from '@/types/vibebuilder';

export function HeroSection({
  heading,
  subtext,
  bgColor,
  imageUrl,
  ctaText,
  alignment = 'left',
  overlayOpacity = 0.3,
  gradientFrom,
  gradientTo,
}: HeroSectionProps) {
  const alignClass =
    alignment === 'center' ? 'items-center text-center' :
    alignment === 'right'  ? 'items-end text-right'    : 'items-start text-left';

  const bgStyle: React.CSSProperties = gradientFrom && gradientTo
    ? { background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }
    : { backgroundColor: bgColor };

  return (
    <section className="relative w-full min-h-[500px] flex items-center overflow-hidden" style={bgStyle}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: overlayOpacity }}
          aria-hidden
          loading="lazy"
        />
      )}
      {/* Subtle gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
      <div className={`relative z-10 w-full max-w-5xl mx-auto px-8 py-20 flex flex-col gap-6 ${alignClass}`}>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-sm">
          {heading}
        </h1>
        {subtext && (
          <p className="text-lg md:text-2xl text-white/85 max-w-2xl font-light leading-relaxed">
            {subtext}
          </p>
        )}
        {ctaText && (
          <div className="mt-2">
            <button
              type="button"
              className="inline-flex items-center px-8 py-3.5 rounded-xl bg-white text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              style={{ color: gradientFrom ?? bgColor }}
            >
              {ctaText}
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
