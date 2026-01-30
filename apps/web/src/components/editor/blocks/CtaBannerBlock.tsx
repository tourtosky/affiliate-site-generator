import { MousePointer } from 'lucide-react';

interface CtaBannerBlockProps {
  properties: {
    ctaId?: string;
    style?: 'primary' | 'secondary' | 'accent';
    fullWidth?: boolean;
    text?: string;
  };
}

export function CtaBannerBlock({ properties }: CtaBannerBlockProps) {
  const { style = 'primary', text } = properties;

  const bgColors = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-800',
    accent: 'bg-orange-500',
  };

  return (
    <div className={`${bgColors[style]} text-white p-6 rounded-lg text-center`}>
      <p className="mb-3">{text || 'Special offer! Get 20% off today!'}</p>
      <button className="bg-white text-gray-900 px-6 py-2 rounded font-medium inline-flex items-center gap-2">
        <MousePointer className="h-4 w-4" />
        Shop Now
      </button>
    </div>
  );
}
