import { Menu, Search } from 'lucide-react';
import { useProjectContext } from '../EditorContext';

interface NavBlockProps {
  properties: {
    logoUrl?: string;
    sticky?: boolean;
    showSearch?: boolean;
  };
}

export function NavBlock({ properties }: NavBlockProps) {
  const project = useProjectContext();
  const { showSearch, logoUrl } = properties;

  // Use project logo or property logo
  const displayLogo = logoUrl || project.logoUrl;

  return (
    <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {displayLogo ? (
          <img src={displayLogo} alt={project.brandName} className="h-8 object-contain" />
        ) : (
          <span className="font-bold text-lg" style={{ color: project.brandColors.primary }}>
            {project.brandName}
          </span>
        )}
        <nav className="flex gap-4 text-sm text-gray-600">
          <span className="hover:text-gray-900 cursor-pointer">Features</span>
          <span className="hover:text-gray-900 cursor-pointer">Products</span>
          <span className="hover:text-gray-900 cursor-pointer">Compare</span>
          <span className="hover:text-gray-900 cursor-pointer">Reviews</span>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {showSearch && <Search className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />}
        <button
          className="px-4 py-2 rounded text-white text-sm font-medium"
          style={{ backgroundColor: project.brandColors.primary }}
        >
          Shop Now
        </button>
        <Menu className="h-5 w-5 text-gray-400 md:hidden" />
      </div>
    </div>
  );
}
