import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { BlockTypeDefinition } from '@affiliate/shared';
import {
  Image, Navigation, Grid3X3, Star, FileText,
  MousePointer, Columns
} from 'lucide-react';

interface BlockPaletteProps {
  blocks: BlockTypeDefinition[];
}

const categoryIcons: Record<string, typeof Image> = {
  hero: Image,
  navigation: Navigation,
  products: Grid3X3,
  reviews: Star,
  content: FileText,
  cta: MousePointer,
  footer: Columns,
};

function DraggableBlock({ block }: { block: BlockTypeDefinition }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${block.id}`,
    data: { type: 'palette-block', blockType: block.id, defaultProperties: block.defaultProperties },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = categoryIcons[block.category] || FileText;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 p-2 bg-white border rounded cursor-grab hover:border-blue-400 hover:bg-blue-50 transition-colors"
    >
      <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
      <span className="text-sm truncate">{block.name}</span>
    </div>
  );
}

export function BlockPalette({ blocks }: BlockPaletteProps) {
  const categories = [...new Set(blocks.map((b) => b.category))];

  return (
    <div className="w-56 border-r bg-gray-50 p-4 overflow-y-auto">
      <h3 className="font-semibold text-sm text-gray-700 mb-3">Blocks</h3>
      {categories.map((category) => (
        <div key={category} className="mb-4">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">{category}</h4>
          <div className="space-y-1">
            {blocks
              .filter((b) => b.category === category)
              .map((block) => (
                <DraggableBlock key={block.id} block={block} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
