import type { BlockInstance, BlockTypeDefinition, PropertyField } from '@affiliate/shared';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PropertiesPanelProps {
  block: BlockInstance | null;
  blockDefinition: BlockTypeDefinition | null;
  onUpdateProperties: (properties: Record<string, unknown>) => void;
}

function PropertyFieldInput({
  field,
  value,
  onChange,
}: {
  field: PropertyField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (field.type) {
    case 'text':
      return (
        <Input
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );

    case 'textarea':
      return (
        <Textarea
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          value={(value as number) ?? field.defaultValue ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
          min={field.min}
          max={field.max}
        />
      );

    case 'boolean':
      return (
        <Switch
          checked={(value as boolean) ?? false}
          onCheckedChange={onChange}
        />
      );

    case 'select':
      return (
        <Select value={(value as string) || ''} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'image':
      return (
        <Input
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Image URL or path"
        />
      );

    case 'productRef':
    case 'ctaRef':
      return (
        <Input
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`${field.type === 'productRef' ? 'Product' : 'CTA'} ID`}
        />
      );

    case 'productRefs':
      return (
        <Textarea
          value={Array.isArray(value) ? (value as string[]).join('\n') : ''}
          onChange={(e) => onChange(e.target.value.split('\n').filter(Boolean))}
          placeholder="One product ID per line"
          rows={3}
        />
      );

    default:
      return (
        <Input
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

export function PropertiesPanel({
  block,
  blockDefinition,
  onUpdateProperties,
}: PropertiesPanelProps) {
  if (!block || !blockDefinition) {
    return (
      <div className="w-72 border-l bg-white p-4">
        <p className="text-gray-500 text-sm">Select a block to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="w-72 border-l bg-white p-4 overflow-y-auto">
      <h3 className="font-semibold text-sm mb-1">{blockDefinition.name}</h3>
      <p className="text-xs text-gray-500 mb-4">{blockDefinition.description}</p>

      <div className="space-y-4">
        {blockDefinition.properties.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <Label className="text-xs">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <PropertyFieldInput
              field={field}
              value={block.properties[field.name]}
              onChange={(newValue) =>
                onUpdateProperties({ [field.name]: newValue })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
