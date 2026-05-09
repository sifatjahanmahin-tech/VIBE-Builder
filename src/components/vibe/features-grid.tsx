import { FeaturesGridProps } from '@/types/vibebuilder';

export function FeaturesGrid({ title, features }: FeaturesGridProps) {
  return (
    <section style={{ backgroundColor: '#ffffff', width: '100%', padding: '64px 32px' }}>
      <div style={{ maxWidth: 1024, margin: '0 auto' }}>
        {title && (
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: 48,
            color: '#111827',
          }}>
            {title}
          </h2>
        )}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
        }}>
          {features.map((feature, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '2.25rem', lineHeight: 1 }}>{feature.icon}</span>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827', margin: 0 }}>{feature.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
