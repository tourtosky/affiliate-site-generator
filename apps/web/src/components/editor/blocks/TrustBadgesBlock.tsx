import { Shield, RefreshCw, Truck, Headphones } from 'lucide-react';
import { useProjectContext } from '../EditorContext';

interface TrustBadgesBlockProps {
  properties: {
    showSecurePayment?: boolean;
    showMoneyBack?: boolean;
    showFreeShipping?: boolean;
    showSupport?: boolean;
    layout?: 'horizontal' | 'grid';
  };
}

export function TrustBadgesBlock({ properties }: TrustBadgesBlockProps) {
  const project = useProjectContext();
  const {
    showSecurePayment = true,
    showMoneyBack = true,
    showFreeShipping = false,
    showSupport = true,
    layout = 'horizontal',
  } = properties;

  const badges = [
    { show: showSecurePayment, icon: Shield, label: 'Secure Payment' },
    { show: showMoneyBack, icon: RefreshCw, label: 'Money Back' },
    { show: showFreeShipping, icon: Truck, label: 'Free Shipping' },
    { show: showSupport, icon: Headphones, label: '24/7 Support' },
  ].filter((b) => b.show);

  return (
    <div className="bg-gray-50 border rounded-lg p-4">
      <div
        className={layout === 'horizontal' ? 'flex justify-center gap-8' : 'grid grid-cols-2 gap-4'}
      >
        {badges.map((badge, i) => (
          <div key={i} className="flex flex-col items-center gap-2 text-center">
            <badge.icon className="h-8 w-8" style={{ color: project.brandColors.primary }} />
            <span className="text-sm font-medium">{badge.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
