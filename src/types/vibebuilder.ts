export enum ComponentType {
  Hero = 'Hero',
  TextBlock = 'TextBlock',
  ImageGallery = 'ImageGallery',
  ContactForm = 'ContactForm',
}

export type TextAlignment = 'left' | 'center' | 'right' | 'justify';
export type ContactFormFieldType = 'text' | 'email' | 'textarea' | 'tel';

export interface HeroSectionProps {
  heading: string;
  subtext: string;
  bgColor: string;
  imageUrl: string;
  ctaText: string;
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

export type VibeComponentProps =
  | HeroSectionProps
  | TextBlockProps
  | ImageGalleryProps
  | ContactFormProps;

export interface VibeComponent {
  id: string;
  type: ComponentType;
  order: number;
  props: VibeComponentProps;
}

export interface PageLayout {
  _id?: string; // MongoDB document ID — used for updates/deletes
  pageId: string;
  siteId: string; // parent site reference — used to query all pages of a site
  userId: string;
  pageName: string;
  slug: string;
  isPublished: boolean;
  components: VibeComponent[];
}

export interface WebsiteProject {
  _id?: string; // MongoDB document ID
  siteId: string;
  userId: string;
  siteName: string;
}

export type PartialProps<T extends VibeComponentProps> = Partial<T>;

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  defaultProps: VibeComponentProps;
}

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  {
    type: ComponentType.Hero,
    label: 'Hero Section',
    defaultProps: {
      heading: 'Welcome to My Site',
      subtext: 'Build something amazing today.',
      bgColor: '#1e3a5f',
      imageUrl: '',
      ctaText: 'Get Started',
    } satisfies HeroSectionProps,
  },
  {
    type: ComponentType.TextBlock,
    label: 'Text Block',
    defaultProps: {
      content: 'Add your content here.',
      fontSize: '16px',
      textColor: '#1a1a1a',
      alignment: 'left',
    } satisfies TextBlockProps,
  },
  {
    type: ComponentType.ImageGallery,
    label: 'Image Gallery',
    defaultProps: {
      images: [],
      columns: 3,
      gap: 16,
    } satisfies ImageGalleryProps,
  },
  {
    type: ComponentType.ContactForm,
    label: 'Contact Form',
    defaultProps: {
      title: 'Get in Touch',
      fields: [
        { name: 'name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: true },
      ],
      submitText: 'Send Message',
    } satisfies ContactFormProps,
  },
];
