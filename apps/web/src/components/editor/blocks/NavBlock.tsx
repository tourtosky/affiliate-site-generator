import { Menu, Search } from 'lucide-react';

interface NavBlockProps {
  properties: {
    logoUrl?: string;
    sticky?: boolean;
    showSearch?: boolean;
  };
}

export function NavBlock({ properties }: NavBlockProps) {
  const { showSearch } = properties;

  return (
    <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">
          Logo
        </div>
        <nav className="flex gap-4 text-sm text-gray-600">
          <span>Home</span>
          <span>Products</span>
          <span>About</span>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        {showSearch && <Search className="h-4 w-4 text-gray-400" />}
        <Menu className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
}
