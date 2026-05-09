import { ImageGalleryProps } from '@/types/vibebuilder';

export function ImageGallery({ images, columns, gap }: ImageGalleryProps) {
  if (!images.length) {
    return (
      <section className="w-full px-8 py-10 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-32 rounded-lg border-2 border-dashed text-sm" style={{ color: '#9ca3af' }}>
          No images added yet.
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-8 py-10 max-w-4xl mx-auto">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {images.map((src, idx) => (
          <div key={idx} className="overflow-hidden rounded-lg aspect-square" style={{ backgroundColor: '#f3f4f6' }}>
            <img
              src={src}
              alt={`Gallery image ${idx + 1}`}
              className="w-full h-full object-cover transition-transform hover:scale-105"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
