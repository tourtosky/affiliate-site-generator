import { Star, Package } from 'lucide-react';

interface ProductGridBlockProps {
  properties: {
    productIds?: string[];
    columns?: number;
    showRatings?: boolean;
    showPrices?: boolean;
  };
}

export function ProductGridBlock({ properties }: ProductGridBlockProps) {
  const { productIds = [], columns = 3, showRatings, showPrices } = properties;
  const displayCount = productIds.length || 3;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: Math.min(displayCount, 6) }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-3 border">
            <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-300" />
            </div>
            <div className="text-sm font-medium truncate">Product {i + 1}</div>
            {showRatings && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-500">4.5</span>
              </div>
            )}
            {showPrices && (
              <div className="text-sm font-bold text-green-600 mt-1">$99.99</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
