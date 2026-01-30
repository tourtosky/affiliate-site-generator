import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import type { BlockInstance } from '@affiliate/shared';
import { getBlockComponent } from './blocks';

interface CanvasBlockProps {
  block: BlockInstance;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function CanvasBlock({ block, isSelected, onSelect, onDelete }: CanvasBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.instanceId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const BlockComponent = getBlockComponent(block.blockType);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`relative group rounded-lg transition-all ${
        isSelected
          ? 'ring-2 ring-blue-500 ring-offset-2'
          : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
      }`}
    >
      {/* Drag handle and actions */}
      <div className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 bg-white border rounded shadow-sm cursor-grab hover:bg-gray-50"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 bg-white border rounded shadow-sm hover:bg-red-50 hover:border-red-200"
        >
          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
        </button>
      </div>

      {/* Block content */}
      {BlockComponent ? (
        <BlockComponent properties={block.properties} />
      ) : (
        <div className="bg-gray-100 p-4 rounded text-center text-gray-500">
          Unknown block: {block.blockType}
        </div>
      )}
    </div>
  );
}
