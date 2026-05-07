import { FeaturesGridProps } from '@/types/vibebuilder';

export function FeaturesGrid({ title, features }: FeaturesGridProps) {
  return (
    <section className="w-full px-8 py-16 bg-background">
      <div className="max-w-5xl mx-auto">
        {title && (
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-foreground">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group rounded-2xl border bg-card p-7 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <span className="text-4xl leading-none">{feature.icon}</span>
              <h3 className="text-lg font-bold text-card-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
