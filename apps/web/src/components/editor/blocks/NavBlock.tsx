import { Menu, Search } from 'lucide-react';
import { useProjectContext } from '../EditorContext';

interface NavBlockProps {
  properties: {
    logoUrl?: string;
    sticky?: boolean;
    showSearch?: boolean;
  };
}

const navLinks = ['Features', 'Products', 'Compare', 'Reviews'];

export function NavBlock({ properties }: NavBlockProps) {
  const project = useProjectContext();
  const { showSearch, logoUrl } = properties;

  // Use project logo or property logo
  const displayLogo = logoUrl || project.logoUrl;

  return (
    <div className="bg-white border-b rounded-lg">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Logo & Nav */}
        <div className="flex items-center gap-8">
          {displayLogo ? (
            <img src={displayLogo} alt={project.brandName} className="h-10 object-contain max-w-[160px]" />
          ) : (
            <span className="font-extrabold text-xl" style={{ color: project.brandColors.primary }}>
              {project.brandName}
            </span>
          )}
          <nav className="flex gap-6 text-sm text-gray-500">
            {navLinks.map((link) => (
              <span key={link} className="hover:text-gray-900 cursor-pointer font-medium">
                {link}
              </span>
            ))}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {showSearch && <Search className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />}
          <button
            className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors"
            style={{ backgroundColor: project.brandColors.primary }}
          >
            Shop Now
          </button>
          <Menu className="h-5 w-5 text-gray-400 md:hidden" />
        </div>
      </div>
    </div>
  );
}
