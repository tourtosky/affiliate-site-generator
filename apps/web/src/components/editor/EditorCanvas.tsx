import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { BlockInstance } from '@affiliate/shared';
import { CanvasBlock } from './CanvasBlock';

interface EditorCanvasProps {
  blocks: BlockInstance[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
}

export function EditorCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
}: EditorCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  return (
    <div
      ref={setNodeRef}
      onClick={() => onSelectBlock(null)}
      className={`flex-1 p-8 overflow-y-auto bg-gray-100 ${
        isOver ? 'bg-blue-50' : ''
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {blocks.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <Plus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Drag blocks here to start building</p>
          </div>
        ) : (
          <SortableContext
            items={blocks.map((b) => b.instanceId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4 pl-10">
              {blocks.map((block) => (
                <CanvasBlock
                  key={block.instanceId}
                  block={block}
                  isSelected={selectedBlockId === block.instanceId}
                  onSelect={() => onSelectBlock(block.instanceId)}
                  onDelete={() => onDeleteBlock(block.instanceId)}
                />
              ))}
            </div>
          </SortableContext>
        )}

        {/* Drop indicator at bottom */}
        {blocks.length > 0 && (
          <div
            className={`mt-4 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              isOver ? 'border-blue-400 bg-blue-50' : 'border-transparent'
            }`}
          >
            {isOver && <span className="text-blue-500 text-sm">Drop here to add</span>}
          </div>
        )}
      </div>
    </div>
  );
}
