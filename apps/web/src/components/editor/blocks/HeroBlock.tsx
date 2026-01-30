import { Image } from 'lucide-react';
import { useProjectContext } from '../EditorContext';

interface HeroBlockProps {
  properties: {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    alignment?: 'left' | 'center' | 'right';
  };
}

export function HeroBlock({ properties }: HeroBlockProps) {
  const project = useProjectContext();
  const { title, subtitle, alignment = 'center', backgroundImage } = properties;

  // Use project brand name if no custom title set
  const displayTitle = title || `Discover ${project.brandName}'s Quality`;
  const displaySubtitle = subtitle || project.brandDescription || 'Top-rated products handpicked for you';

  const alignClass = alignment === 'left' ? 'text-left' : alignment === 'right' ? 'text-right' : 'text-center';

  return (
    <div
      className={`relative text-white p-8 rounded-lg ${alignClass} overflow-hidden`}
      style={{
        background: backgroundImage
          ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundImage}) center/cover`
          : `linear-gradient(135deg, ${project.brandColors.primary}, ${project.brandColors.secondary})`,
      }}
    >
      <div className="max-w-2xl mx-auto relative z-10">
        <h2 className="text-2xl font-bold mb-2">{displayTitle}</h2>
        <p className="text-white/80">{displaySubtitle}</p>
        <div
          className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded font-semibold"
          style={{ backgroundColor: project.brandColors.accent }}
        >
          <Image className="h-4 w-4" />
          <span>Shop Now</span>
        </div>
      </div>
    </div>
  );
}
