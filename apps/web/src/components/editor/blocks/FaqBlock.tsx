import { ChevronDown } from 'lucide-react';
import { useProjectContext } from '../EditorContext';

interface FaqBlockProps {
  properties: {
    heading?: string;
    expandable?: boolean;
    items?: string;
  };
}

export function FaqBlock({ properties }: FaqBlockProps) {
  const project = useProjectContext();
  const { heading = `${project.brandName} FAQ`, items } = properties;

  let faqItems: { question: string; answer: string }[] = [];
  try {
    faqItems = JSON.parse(items || '[]');
  } catch {
    faqItems = [];
  }

  if (faqItems.length === 0) {
    faqItems = [
      { question: 'What is your return policy?', answer: 'We offer a 30-day return policy.' },
      { question: 'How long does shipping take?', answer: 'Shipping typically takes 3-5 business days.' },
    ];
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">{heading}</h3>
      <div className="space-y-2">
        {faqItems.map((item, i) => (
          <div key={i} className="border rounded">
            <div className="flex items-center justify-between p-3 bg-gray-50">
              <span className="font-medium text-sm">{item.question}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
            <div className="p-3 text-sm text-gray-600">{item.answer}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
