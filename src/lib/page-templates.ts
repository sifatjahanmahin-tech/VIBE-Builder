import { v4 as uuidv4 } from 'uuid';
import { ComponentType, COMPONENT_DEFINITIONS, VibeComponent } from '@/types/vibebuilder';

interface TemplateSlot {
  type: ComponentType;
  overrides?: Record<string, unknown>;
}

export interface PageTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  slots: TemplateSlot[];
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'landing',
    name: 'Landing Page',
    emoji: '🚀',
    description: 'Hero + Features + CTA + Contact',
    slots: [
      { type: ComponentType.Navbar },
      { type: ComponentType.Hero },
      { type: ComponentType.FeaturesGrid },
      { type: ComponentType.CTABanner },
      { type: ComponentType.ContactForm },
      { type: ComponentType.Footer },
    ],
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    emoji: '🎨',
    description: 'Hero + Gallery + Testimonial + Contact',
    slots: [
      { type: ComponentType.Navbar },
      { type: ComponentType.Hero, overrides: { heading: 'My Portfolio', subtext: 'A curated collection of my best work and projects.' } },
      { type: ComponentType.ImageGallery },
      { type: ComponentType.Testimonial },
      { type: ComponentType.ContactForm },
      { type: ComponentType.Footer },
    ],
  },
  {
    id: 'blog',
    name: 'Blog Post',
    emoji: '✍️',
    description: 'Hero + Text blocks + CTA',
    slots: [
      { type: ComponentType.Navbar },
      { type: ComponentType.Hero, overrides: { heading: 'Your Blog Post Title', subtext: 'A compelling introduction to this post.' } },
      { type: ComponentType.TextBlock },
      { type: ComponentType.TextBlock, overrides: { content: 'Continue your article content here. Add more context, examples, or stories.' } },
      { type: ComponentType.CTABanner },
      { type: ComponentType.Footer },
    ],
  },
  {
    id: 'about',
    name: 'About Page',
    emoji: '👋',
    description: 'Hero + Text + Features + Contact',
    slots: [
      { type: ComponentType.Navbar },
      { type: ComponentType.Hero, overrides: { heading: 'About Us', subtext: 'Learn more about our story, mission, and the team behind it all.' } },
      { type: ComponentType.TextBlock, overrides: { content: 'We started with a simple mission: to make the world a better place through great products and meaningful connections. Our team is passionate, dedicated, and driven by results.' } },
      { type: ComponentType.FeaturesGrid },
      { type: ComponentType.ContactForm },
      { type: ComponentType.Footer },
    ],
  },
  {
    id: 'product',
    name: 'Product Page',
    emoji: '📦',
    description: 'Hero + Features + Testimonial + CTA',
    slots: [
      { type: ComponentType.Navbar },
      { type: ComponentType.Hero, overrides: { heading: 'Introducing Our Product', subtext: 'The all-in-one solution that transforms the way you work.' } },
      { type: ComponentType.FeaturesGrid },
      { type: ComponentType.Testimonial },
      { type: ComponentType.CTABanner, overrides: { heading: 'Ready to get started?', buttonText: 'Try It Free' } },
      { type: ComponentType.Footer },
    ],
  },
];

export function buildTemplateComponents(template: PageTemplate): VibeComponent[] {
  return template.slots
    .map((slot, index) => {
      const def = COMPONENT_DEFINITIONS.find((d) => d.type === slot.type);
      if (!def) return null;
      return {
        id: uuidv4(),
        type: slot.type,
        order: index,
        props: slot.overrides
          ? { ...def.defaultProps, ...slot.overrides }
          : { ...def.defaultProps },
      } as VibeComponent;
    })
    .filter((c): c is VibeComponent => c !== null);
}
