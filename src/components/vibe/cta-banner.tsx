import { CTABannerProps } from '@/types/vibebuilder';

export function CTABanner({ heading, subtext, buttonText, buttonUrl, bgColor, textColor }: CTABannerProps) {
  return (
    <section className="w-full px-8 py-20" style={{ backgroundColor: bgColor }}>
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-5">
        <h2
          className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight"
          style={{ color: textColor }}
        >
          {heading}
        </h2>
        {subtext && (
          <p className="text-lg md:text-xl max-w-xl leading-relaxed" style={{ color: textColor, opacity: 0.75 }}>
            {subtext}
          </p>
        )}
        {buttonText && (
          <a
            href={buttonUrl || '#'}
            className="mt-2 inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-base font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
            style={{ color: bgColor }}
          >
            {buttonText}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </div>
    </section>
  );
}
