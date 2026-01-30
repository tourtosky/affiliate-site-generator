import { Facebook, Twitter, Instagram } from 'lucide-react';

interface FooterBlockProps {
  properties: {
    copyright?: string;
    showSocialLinks?: boolean;
    columns?: number;
  };
}

export function FooterBlock({ properties }: FooterBlockProps) {
  const { copyright = '© 2024 All rights reserved', showSocialLinks = true, columns = 3 } = properties;

  return (
    <div className="bg-gray-900 text-white rounded-lg p-6">
      <div className={`grid gap-8 mb-6`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i}>
            <h4 className="font-medium mb-2">Column {i + 1}</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>Link 1</li>
              <li>Link 2</li>
              <li>Link 3</li>
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-700 pt-4 flex items-center justify-between">
        <span className="text-sm text-gray-400">{copyright}</span>
        {showSocialLinks && (
          <div className="flex gap-3">
            <Facebook className="h-5 w-5 text-gray-400" />
            <Twitter className="h-5 w-5 text-gray-400" />
            <Instagram className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
}
