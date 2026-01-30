import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useProjectContext } from '../EditorContext';

interface ReviewSummaryBlockProps {
  properties: {
    productId?: string;
    showProscons?: boolean;
    rating?: number;
    verdict?: string;
  };
}

export function ReviewSummaryBlock({ properties }: ReviewSummaryBlockProps) {
  const project = useProjectContext();
  const { productId, showProscons, rating = 4, verdict } = properties;

  // Find selected product or use first product for context
  const product = productId
    ? project.products.find((p) => p.id === productId)
    : project.products[0];

  const productName = product?.customTitle || product?.generatedTitle || product?.title || 'this product';

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl font-bold">{rating}</div>
        <div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-500">Overall Rating</div>
        </div>
      </div>

      {showProscons && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 rounded p-3">
            <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
              <ThumbsUp className="h-4 w-4" /> Pros
            </div>
            <ul className="text-sm text-green-600 space-y-1">
              <li>- Pro point 1</li>
              <li>- Pro point 2</li>
            </ul>
          </div>
          <div className="bg-red-50 rounded p-3">
            <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
              <ThumbsDown className="h-4 w-4" /> Cons
            </div>
            <ul className="text-sm text-red-600 space-y-1">
              <li>- Con point 1</li>
              <li>- Con point 2</li>
            </ul>
          </div>
        </div>
      )}

      {verdict && (
        <div className="bg-gray-50 rounded p-3">
          <div className="font-medium mb-1">Verdict</div>
          <p className="text-sm text-gray-600">{verdict || `Overall, ${productName} delivers excellent value.`}</p>
        </div>
      )}
    </div>
  );
}
