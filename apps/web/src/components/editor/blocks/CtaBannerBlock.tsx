import { ArrowRight } from 'lucide-react';
import { useProjectContext } from '../EditorContext';

interface CtaBannerBlockProps {
  properties: {
    ctaId?: string;
    style?: 'primary' | 'secondary' | 'accent';
    fullWidth?: boolean;
    text?: string;
  };
}

export function CtaBannerBlock({ properties }: CtaBannerBlockProps) {
  const project = useProjectContext();
  const { style = 'primary', text, ctaId } = properties;

  // Find CTA by ID if specified
  const cta = ctaId ? project.ctas.find((c) => c.id === ctaId) : null;
  const buttonLabel = cta?.label || 'Shop Now';

  // Map style to project colors
  const getBackgroundColor = () => {
    switch (style) {
      case 'accent':
        return project.brandColors.accent;
      case 'secondary':
        return project.brandColors.secondary;
      default:
        return project.brandColors.primary;
    }
  };

  const displayText = text || `Don't miss out on ${project.brandName}'s best products!`;

  return (
    <div
      className="text-white p-6 rounded-lg text-center"
      style={{ backgroundColor: getBackgroundColor() }}
    >
      <p className="mb-4 text-lg">{displayText}</p>
      <button className="bg-white text-gray-900 px-6 py-3 rounded font-semibold inline-flex items-center gap-2 hover:bg-gray-100 transition-colors">
        {buttonLabel}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
