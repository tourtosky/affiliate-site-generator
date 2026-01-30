import { Zap, CheckCircle, DollarSign, Heart } from 'lucide-react';
import { useProjectContext } from '../EditorContext';

interface FeaturesBlockProps {
  properties: {
    title?: string;
    subtitle?: string;
    columns?: number;
  };
}

const defaultFeatures = [
  { icon: Zap, title: 'Unmatched Durability', description: 'Our products are built to last, ensuring long-term satisfaction.' },
  { icon: CheckCircle, title: 'Innovative Design', description: 'Experience cutting-edge designs that blend functionality with style.' },
  { icon: DollarSign, title: 'Affordable Quality', description: 'Get premium quality without breaking the bank, perfect for every budget.' },
  { icon: Heart, title: 'Customer Satisfaction', description: 'Join thousands of happy customers who love our reliable products.' },
];

export function FeaturesBlock({ properties }: FeaturesBlockProps) {
  const project = useProjectContext();
  const {
    title = `Why Choose ${project.brandName}?`,
    subtitle = 'Discover the advantages of our products.',
    columns = 4
  } = properties;

  return (
    <div className="bg-white rounded-lg p-8">
      {/* Section Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-2xl font-extrabold mb-2">{title}</h2>
        <p className="text-gray-500">{subtitle}</p>
      </div>

      {/* Features Grid */}
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: `repeat(${Math.min(columns, 4)}, 1fr)` }}
      >
        {defaultFeatures.slice(0, columns).map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div key={i} className="bg-gray-50 rounded-xl p-6 transition-all hover:shadow-lg">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: project.brandColors.primary }}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
