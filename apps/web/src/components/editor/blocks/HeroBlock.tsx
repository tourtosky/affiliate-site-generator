import { Image } from 'lucide-react';

interface HeroBlockProps {
  properties: {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    alignment?: 'left' | 'center' | 'right';
  };
}

export function HeroBlock({ properties }: HeroBlockProps) {
  const { title, subtitle, alignment = 'center' } = properties;

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg text-${alignment}`}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">{title || 'Hero Title'}</h2>
        <p className="text-blue-100">{subtitle || 'Hero subtitle text goes here'}</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded">
          <Image className="h-4 w-4" />
          <span className="text-sm">CTA Button</span>
        </div>
      </div>
    </div>
  );
}
