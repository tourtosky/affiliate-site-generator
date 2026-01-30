import { Package } from 'lucide-react';

interface ProductSpotlightBlockProps {
  properties: {
    productId?: string;
    layout?: 'left' | 'right';
    showSpecs?: boolean;
  };
}

export function ProductSpotlightBlock({ properties }: ProductSpotlightBlockProps) {
  const { layout = 'left', showSpecs } = properties;

  const imageSection = (
    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
      <Package className="h-16 w-16 text-gray-300" />
    </div>
  );

  const contentSection = (
    <div className="space-y-3">
      <h3 className="text-xl font-bold">Featured Product</h3>
      <p className="text-gray-600 text-sm">Product description goes here with detailed information about features and benefits.</p>
      {showSpecs && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>- Specification 1</div>
          <div>- Specification 2</div>
          <div>- Specification 3</div>
        </div>
      )}
      <div className="bg-blue-600 text-white px-4 py-2 rounded text-sm inline-block">
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
