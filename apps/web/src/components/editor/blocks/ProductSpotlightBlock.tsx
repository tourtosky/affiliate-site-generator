import { Package } from 'lucide-react';
import { useProjectContext } from '../EditorContext';

interface ProductSpotlightBlockProps {
  properties: {
    productId?: string;
    layout?: 'left' | 'right';
    showSpecs?: boolean;
  };
}

export function ProductSpotlightBlock({ properties }: ProductSpotlightBlockProps) {
  const project = useProjectContext();
  const { productId, layout = 'left', showSpecs } = properties;

  // Find selected product or use first product
  const product = productId
    ? project.products.find((p) => p.id === productId)
    : project.products[0];

  const title = product?.customTitle || product?.generatedTitle || product?.title || 'Featured Product';
  const description = product?.customDescription || product?.generatedDescription || 'Product description goes here with detailed information about features and benefits.';

  const imageSection = (
    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
      {product?.imageUrl ? (
        <img src={product.imageUrl} alt={title} className="w-full h-full object-cover" />
      ) : (
        <Package className="h-16 w-16 text-gray-300" />
      )}
    </div>
  );

  const contentSection = (
    <div className="space-y-3">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
      {showSpecs && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>- Specification 1</div>
          <div>- Specification 2</div>
          <div>- Specification 3</div>
        </div>
      )}
      <div
        className="text-white px-4 py-2 rounded text-sm inline-block"
        style={{ backgroundColor: project.brandColors.primary }}
      >
        View Product
      </div>
    </div>
  );

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className={`grid grid-cols-2 gap-6 ${layout === 'right' ? 'direction-rtl' : ''}`}>
        {layout === 'left' ? (
          <>
            {imageSection}
            {contentSection}
          </>
        ) : (
          <>
            {contentSection}
            {imageSection}
          </>
        )}
      </div>
    </div>
  );
}
