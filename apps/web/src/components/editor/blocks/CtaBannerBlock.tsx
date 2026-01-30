import { ArrowRight } from 'lucide-react';
import { useProjectContext } from '../EditorContext';

interface CtaBannerBlockProps {
  properties: {
    ctaId?: string;
    style?: 'primary' | 'secondary' | 'accent';
    fullWidth?: boolean;
    title?: string;
    subtitle?: string;
  };
}

export function CtaBannerBlock({ properties }: CtaBannerBlockProps) {
  const project = useProjectContext();
  const { title, subtitle, ctaId } = properties;

  // Find CTA by ID if specified
  const cta = ctaId ? project.ctas.find((c) => c.id === ctaId) : null;
  const buttonLabel = cta?.label || 'Shop Now';

  const displayTitle = title || `Shop ${project.brandName} Now!`;
  const displaySubtitle = subtitle || `Don't wait! Grab your favorite ${project.brandName} products while stocks last and elevate your everyday experiences.`;

  return (
    <div
      className="rounded-lg p-12 text-center text-white"
      style={{
        background: `linear-gradient(135deg, ${project.brandColors.primary} 0%, ${project.brandColors.secondary} 100%)`,
      }}
    >
      <h2 className="text-2xl font-extrabold mb-3">{displayTitle}</h2>
      <p className="text-white/90 max-w-lg mx-auto mb-6">{displaySubtitle}</p>
      <button className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all">
        {buttonLabel}
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}
