import { useProjectContext } from '../EditorContext';

interface FooterBlockProps {
  properties: {
    copyright?: string;
    showSocialLinks?: boolean;
    columns?: number;
  };
}

const quickLinks = ['Features', 'Products', 'Compare', 'Reviews'];
const supportLinks = ['Contact Us', 'FAQ', 'Shipping Info', 'Returns'];
const legalLinks = ['Privacy Policy', 'Terms of Service', 'Affiliate Disclosure'];

export function FooterBlock({ properties }: FooterBlockProps) {
  const project = useProjectContext();
  const year = new Date().getFullYear();

  return (
    <div className="bg-gray-900 text-white/70 rounded-lg p-8">
      {/* Footer Grid */}
      <div className="grid grid-cols-4 gap-8 mb-8">
        {/* Brand Column */}
        <div className="col-span-1">
          <div className="text-white font-bold text-xl mb-3" style={{ color: project.brandColors.primary }}>
            {project.brandName}
          </div>
          <p className="text-sm">
            {project.brandDescription || `${project.brandName} - Your trusted source for product recommendations.`}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {quickLinks.map((link) => (
              <li key={link} className="hover:text-white cursor-pointer">{link}</li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            {supportLinks.map((link) => (
              <li key={link} className="hover:text-white cursor-pointer">{link}</li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            {legalLinks.map((link) => (
              <li key={link} className="hover:text-white cursor-pointer">{link}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Affiliate Disclosure */}
      <div className="bg-white/5 rounded-lg p-4 mb-6 text-xs">
        <strong className="text-white">Affiliate Disclosure:</strong> {project.brandName} is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-white/10 pt-6 flex justify-between items-center text-sm">
        <p>&copy; {year} {project.brandName}. All rights reserved.</p>
        <p>As an Amazon Associate, we earn from qualifying purchases.</p>
      </div>
    </div>
  );
}
