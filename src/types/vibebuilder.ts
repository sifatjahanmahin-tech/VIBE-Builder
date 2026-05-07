export enum ComponentType {
  Hero = 'Hero',
  TextBlock = 'TextBlock',
  ImageGallery = 'ImageGallery',
  ContactForm = 'ContactForm',
  Testimonial = 'Testimonial',
  FeaturesGrid = 'FeaturesGrid',
  CTABanner = 'CTABanner',
}

export type TextAlignment = 'left' | 'center' | 'right' | 'justify';
export type ContactFormFieldType = 'text' | 'email' | 'textarea' | 'tel';

export interface HeroSectionProps {
  heading: string;
  subtext: string;
  bgColor: string;
  imageUrl: string;
  ctaText: string;
  alignment?: 'left' | 'center' | 'right';
  overlayOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
}

export interface TextBlockProps {
  content: string;
  fontSize: string;
  textColor: string;
  alignment: TextAlignment;
}

export interface ImageGalleryProps {
  images: string[];
  columns: number;
  gap: number;
}

export interface ContactFormField {
  name: string;
  label: string;
  type: ContactFormFieldType;
  required: boolean;
}

export interface ContactFormProps {
  title: string;
  fields: ContactFormField[];
  submitText: string;
}

export interface TestimonialProps {
  quote: string;
  authorName: string;
  authorRole: string;
  authorImage: string;
  bgColor: string;
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesGridProps {
  title: string;
  features: FeatureItem[];
}

export interface CTABannerProps {
  heading: string;
  subtext: string;
  buttonText: string;
  buttonUrl: string;
  bgColor: string;
  textColor: string;
}

export type VibeComponentProps =
  | HeroSectionProps
  | TextBlockProps
  | ImageGalleryProps
  | ContactFormProps
  | TestimonialProps
  | FeaturesGridProps
  | CTABannerProps;

export interface VibeComponent {
  id: string;
  type: ComponentType;
  order: number;
  props: VibeComponentProps;
}

export interface PageLayout {
  _id?: string;
  pageId: string;
  siteId: string;
  userId: string;
  pageName: string;
  slug: string;
  isPublished: boolean;
  components: VibeComponent[];
}

export interface WebsiteProject {
  _id?: string;
  siteId: string;
  userId: string;
  siteName: string;
}

export type PartialProps<T extends VibeComponentProps> = Partial<T>;

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  description: string;
  defaultProps: VibeComponentProps;
}

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  {
    type: ComponentType.Hero,
    label: 'Hero Section',
    description: 'Full-width banner with heading, subtext and CTA',
    defaultProps: {
      heading: 'Welcome to Your Site',
      subtext: 'Describe what you do in one compelling sentence.',
      bgColor: '#1a1a2e',
      imageUrl: '',
      ctaText: 'Get Started',
      alignment: 'left',
      overlayOpacity: 0.3,
    } satisfies HeroSectionProps,
  },
  {
    type: ComponentType.TextBlock,
    label: 'Text Block',
    description: 'Rich paragraph with font and alignment controls',
    defaultProps: {
      content: 'Enter your text here...',
      fontSize: '16px',
      textColor: '#333333',
      alignment: 'left',
    } satisfies TextBlockProps,
  },
  {
    type: ComponentType.ImageGallery,
    label: 'Image Gallery',
    description: 'Responsive grid of images with captions',
    defaultProps: {
      images: ['https://picsum.photos/400/300?random=1'],
      columns: 3,
      gap: 16,
    } satisfies ImageGalleryProps,
  },
  {
    type: ComponentType.ContactForm,
    label: 'Contact Form',
    description: 'Customizable form to collect visitor messages',
    defaultProps: {
      title: 'Contact Us',
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: false },
      ],
      submitText: 'Send Message',
    } satisfies ContactFormProps,
  },
  {
    type: ComponentType.Testimonial,
    label: 'Testimonial',
    description: 'Customer quote card with avatar and attribution',
    defaultProps: {
      quote: 'This product changed everything for us. Absolutely incredible service and results!',
      authorName: 'Jane Smith',
      authorRole: 'CEO, Example Co.',
      authorImage: '',
      bgColor: '#1e293b',
    } satisfies TestimonialProps,
  },
  {
    type: ComponentType.FeaturesGrid,
    label: 'Features Grid',
    description: '3-column grid showcasing product features',
    defaultProps: {
      title: 'Why Choose Us',
      features: [
        { icon: '⚡', title: 'Lightning Fast', description: 'Optimised for speed from the ground up.' },
        { icon: '🎨', title: 'Beautiful Design', description: 'Stunning visuals that impress every visitor.' },
        { icon: '🔒', title: 'Secure & Reliable', description: 'Enterprise-grade security built right in.' },
      ],
    } satisfies FeaturesGridProps,
  },
  {
    type: ComponentType.CTABanner,
    label: 'CTA Banner',
    description: 'Full-width call-to-action with a prominent button',
    defaultProps: {
      heading: 'Ready to get started?',
      subtext: 'Join thousands of happy customers today.',
      buttonText: 'Get Started Free',
      buttonUrl: '#',
      bgColor: '#4f46e5',
      textColor: '#ffffff',
    } satisfies CTABannerProps,
  },
];
