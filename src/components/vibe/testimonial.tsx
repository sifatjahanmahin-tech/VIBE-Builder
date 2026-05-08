import { TestimonialProps } from '@/types/vibebuilder';

export function Testimonial({ quote, authorName, authorRole, authorImage, bgColor }: TestimonialProps) {
  return (
    <section className="w-full px-8 py-16" style={{ backgroundColor: bgColor }}>
      <div className="max-w-3xl mx-auto">
        <blockquote className="flex flex-col gap-6">
          {/* Quote mark */}
          <svg className="h-10 w-10 text-white/25" fill="currentColor" viewBox="0 0 32 32" aria-hidden>
            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
          </svg>
          <p className="text-xl md:text-2xl font-medium text-white leading-relaxed">{quote}</p>
          <footer className="flex items-center gap-4">
            {authorImage ? (
              <img
                src={authorImage}
                alt={authorName}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-white/20"
                loading="lazy"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl shrink-0">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-white text-base">{authorName}</p>
              {authorRole && <p className="text-sm text-white/60 mt-0.5">{authorRole}</p>}
            </div>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
