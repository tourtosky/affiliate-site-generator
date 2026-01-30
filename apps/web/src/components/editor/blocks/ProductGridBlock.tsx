import { Star, Package } from 'lucide-react';
import { useProjectContext } from '../EditorContext';

interface ProductGridBlockProps {
  properties: {
    title?: string;
    subtitle?: string;
    productIds?: string[];
    columns?: number;
    showRatings?: boolean;
    showPrices?: boolean;
  };
}

export function ProductGridBlock({ properties }: ProductGridBlockProps) {
  const project = useProjectContext();
  const {
    title = `Featured ${project.brandName} Products`,
    subtitle = 'Explore our top-rated selections.',
    productIds = [],
    columns = 3,
    showRatings = true,
    showPrices = true
  } = properties;

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
    <div className="bg-gray-50 rounded-lg p-8">
      {/* Section Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-2xl font-extrabold mb-2">{title}</h2>
        <p className="text-gray-500">{subtitle}</p>
      </div>

      {/* Products Grid */}
      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {displayProducts.map((product) => {
          const productTitle = product.customTitle || product.generatedTitle || product.title || 'Product';
          const productDesc = product.customDescription || product.generatedDescription || 'High-quality product designed for your needs.';

          return (
            <div
              key={product.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
            >
              {/* Product Image */}
              <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={productTitle} className="w-full h-full object-cover" />
                ) : (
                  <Package className="h-12 w-12 text-gray-300" />
                )}
              </div>

              {/* Product Content */}
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1 truncate">{productTitle}</h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{productDesc}</p>

                {/* Meta: Rating & Price */}
                <div className="flex items-center justify-between mb-3">
                  {showRatings && (
                    <div className="flex items-center gap-1" style={{ color: project.brandColors.accent }}>
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-semibold ml-1">4.8</span>
                    </div>
                  )}
                  {showPrices && (
                    <span
                      className="font-bold text-lg"
                      style={{ color: project.brandColors.primary }}
                    >
                      $XX.XX
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-colors"
                  style={{ backgroundColor: project.brandColors.primary }}
                >
                  View on Amazon
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
