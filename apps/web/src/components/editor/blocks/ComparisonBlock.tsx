import { useProjectContext } from '../EditorContext';

interface ComparisonBlockProps {
  properties: {
    title?: string;
    subtitle?: string;
  };
}

const defaultProducts = ['Product A', 'Product B', 'Product C'];
const defaultFeatures = [
  { name: 'Quality Rating', values: ['★★★★★', '★★★★☆', '★★★☆☆'] },
  { name: 'Prime Eligible', values: ['✓', '✓', '✗'] },
  { name: 'Free Returns', values: ['✓', '✓', '✓'] },
  { name: 'Our Pick', values: ['✓', '✗', '✗'] },
];

export function ComparisonBlock({ properties }: ComparisonBlockProps) {
  const project = useProjectContext();
  const {
    title = `Why ${project.brandName} Stands Out`,
    subtitle = 'See how we compare to the competition.',
  } = properties;

  return (
    <div className="bg-white rounded-lg p-8">
      {/* Section Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-2xl font-extrabold mb-2">{title}</h2>
        <p className="text-gray-500">{subtitle}</p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-hidden rounded-xl shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="p-4 text-left font-semibold">Feature</th>
              {defaultProducts.map((product, i) => (
                <th key={i} className="p-4 text-left font-semibold">{product}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {defaultFeatures.map((feature, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-medium">{feature.name}</td>
                {feature.values.map((value, j) => (
                  <td key={j} className="p-4">
                    <span className={value === '✓' ? 'text-green-500 font-bold' : value === '✗' ? 'text-red-500' : ''}>
                      {value}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
