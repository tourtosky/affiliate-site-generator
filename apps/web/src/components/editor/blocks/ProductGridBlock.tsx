import { Star, Package } from 'lucide-react';
import { useProjectContext } from '../EditorContext';

interface ProductGridBlockProps {
  properties: {
    productIds?: string[];
    columns?: number;
    showRatings?: boolean;
    showPrices?: boolean;
  };
}

export function ProductGridBlock({ properties }: ProductGridBlockProps) {
  const project = useProjectContext();
  const { productIds = [], columns = 3, showRatings = true, showPrices = true } = properties;

  // Get products from project, filter by productIds if specified
  let displayProducts = project.products;
  if (productIds.length > 0) {
    displayProducts = productIds
      .map((id) => project.products.find((p) => p.id === id))
      .filter(Boolean) as typeof project.products;
  }

  // Limit to 6 products max for preview
  displayProducts = displayProducts.slice(0, 6);

  // If no products, show placeholders
  if (displayProducts.length === 0) {
    displayProducts = Array.from({ length: 3 }).map((_, i) => ({
      id: `placeholder-${i}`,
      asin: '',
      title: `Product ${i + 1}`,
      customTitle: null,
      customDescription: null,
      imageUrl: null,
      generatedTitle: null,
      generatedDescription: null,
    }));
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {displayProducts.map((product) => {
          const title = product.customTitle || product.generatedTitle || product.title || 'Product';
          return (
            <div key={product.id} className="bg-white rounded-lg p-3 border hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <Package className="h-8 w-8 text-gray-300" />
                )}
              </div>
              <div className="text-sm font-medium truncate">{title}</div>
              {showRatings && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-500">4.5</span>
                </div>
              )}
              {showPrices && (
                <div
                  className="text-sm font-bold mt-1"
                  style={{ color: project.brandColors.primary }}
                >
                  View Price
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
