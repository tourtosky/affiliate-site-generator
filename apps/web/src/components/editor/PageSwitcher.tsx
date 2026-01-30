import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PageSwitcherProps {
  currentPage: string;
  availablePages: string[];
  onChange: (page: string) => void;
}

export function PageSwitcher({ currentPage, availablePages, onChange }: PageSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Page:</span>
      <Select value={currentPage} onValueChange={onChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availablePages.map((page) => (
            <SelectItem key={page} value={page}>
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
