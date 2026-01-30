import { ArrowRight } from 'lucide-react';
import { useProjectContext } from '../EditorContext';

interface HeroBlockProps {
  properties: {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    badge?: string;
    alignment?: 'left' | 'center' | 'right';
  };
}

export function HeroBlock({ properties }: HeroBlockProps) {
  const project = useProjectContext();
  const { title, subtitle, badge = 'TOP RATED 2024', backgroundImage } = properties;

  const displayTitle = title || `Discover ${project.brandName}'s Exceptional Quality`;
  const displaySubtitle = subtitle || project.brandDescription || 'Elevate your lifestyle with top-notch products crafted for durability and performance.';

  return (
    <div
      className="relative rounded-lg overflow-hidden text-white"
      style={{
        background: `linear-gradient(135deg, #111827 0%, #1f2937 100%)`,
        minHeight: '300px',
      }}
    >
      {/* Background image overlay */}
      {backgroundImage && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      <div className="relative z-10 p-8 max-w-xl">
        {/* Badge */}
        <span
          className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide mb-4"
          style={{
            backgroundColor: project.brandColors.accent,
            color: '#111827'
          }}
        >
          {badge}
        </span>

        {/* Title */}
        <h1 className="text-3xl font-extrabold leading-tight mb-4">
          {displayTitle}
        </h1>

        {/* Subtitle */}
        <p className="text-white/80 text-base mb-6 max-w-md">
          {displaySubtitle}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all"
            style={{
              backgroundColor: project.brandColors.accent,
              color: '#111827'
            }}
          >
            Shop Now
            <ArrowRight className="h-4 w-4" />
          </button>
          <button className="px-6 py-3 rounded-lg font-semibold text-sm border-2 border-white/30 text-white hover:border-white transition-all">
            View Products
          </button>
        </div>
      </div>
    </div>
  );
}
