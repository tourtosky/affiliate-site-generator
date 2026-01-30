import { create } from 'zustand';
import type { BlockInstance, PageLayouts } from '@affiliate/shared';

interface EditorState {
  // Data
  projectId: string | null;
  currentPage: string;
  pageLayouts: PageLayouts;
  availablePages: string[];

  // Selection
  selectedBlockId: string | null;

  // Status
  isDirty: boolean;
  isSaving: boolean;

  // Actions - Initialization
  initEditor: (projectId: string, pageLayouts: PageLayouts, availablePages: string[]) => void;
  resetEditor: () => void;

  // Actions - Page
  setCurrentPage: (page: string) => void;

  // Actions - Blocks
  addBlock: (blockType: string, properties: Record<string, unknown>) => void;
  removeBlock: (instanceId: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  updateBlockProperties: (instanceId: string, properties: Record<string, unknown>) => void;

  // Actions - Selection
  selectBlock: (instanceId: string | null) => void;

  // Actions - Persistence
  markSaved: () => void;
  setSaving: (saving: boolean) => void;

  // Getters
  getCurrentPageBlocks: () => BlockInstance[];
  getSelectedBlock: () => BlockInstance | null;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  projectId: null,
  currentPage: 'home',
  pageLayouts: {},
  availablePages: ['home'],
  selectedBlockId: null,
  isDirty: false,
  isSaving: false,

  // Initialize editor with project data
  initEditor: (projectId, pageLayouts, availablePages) => {
    set({
      projectId,
      pageLayouts,
      availablePages,
      currentPage: availablePages[0] || 'home',
      selectedBlockId: null,
      isDirty: false,
      isSaving: false,
    });
  },

  // Reset editor state
  resetEditor: () => {
    set({
      projectId: null,
      currentPage: 'home',
      pageLayouts: {},
      availablePages: ['home'],
      selectedBlockId: null,
      isDirty: false,
      isSaving: false,
    });
  },

  // Switch current page
  setCurrentPage: (page) => {
    set({ currentPage: page, selectedBlockId: null });
  },

  // Add a new block to current page
  addBlock: (blockType, properties) => {
    const { currentPage, pageLayouts } = get();
    const currentBlocks = pageLayouts[currentPage]?.blocks || [];

    const newBlock: BlockInstance = {
      instanceId: crypto.randomUUID(),
      blockType,
      order: currentBlocks.length,
      properties,
    };

    set({
      pageLayouts: {
        ...pageLayouts,
        [currentPage]: {
          blocks: [...currentBlocks, newBlock],
        },
      },
      isDirty: true,
      selectedBlockId: newBlock.instanceId,
    });
  },

  // Remove block from current page
  removeBlock: (instanceId) => {
    const { currentPage, pageLayouts, selectedBlockId } = get();
    const currentBlocks = pageLayouts[currentPage]?.blocks || [];

    const newBlocks = currentBlocks
      .filter((b) => b.instanceId !== instanceId)
      .map((b, i) => ({ ...b, order: i }));

    set({
      pageLayouts: {
        ...pageLayouts,
        [currentPage]: { blocks: newBlocks },
      },
      isDirty: true,
      selectedBlockId: selectedBlockId === instanceId ? null : selectedBlockId,
    });
  },

  // Reorder blocks via drag-drop
  reorderBlocks: (fromIndex, toIndex) => {
    const { currentPage, pageLayouts } = get();
    const currentBlocks = [...(pageLayouts[currentPage]?.blocks || [])];

    const [moved] = currentBlocks.splice(fromIndex, 1);
    currentBlocks.splice(toIndex, 0, moved);

    const reorderedBlocks = currentBlocks.map((b, i) => ({ ...b, order: i }));

    set({
      pageLayouts: {
        ...pageLayouts,
        [currentPage]: { blocks: reorderedBlocks },
      },
      isDirty: true,
    });
  },

  // Update block properties
  updateBlockProperties: (instanceId, properties) => {
    const { currentPage, pageLayouts } = get();
    const currentBlocks = pageLayouts[currentPage]?.blocks || [];

    const newBlocks = currentBlocks.map((b) =>
      b.instanceId === instanceId
        ? { ...b, properties: { ...b.properties, ...properties } }
        : b
    );

    set({
      pageLayouts: {
        ...pageLayouts,
        [currentPage]: { blocks: newBlocks },
      },
      isDirty: true,
    });
  },

  // Select a block
  selectBlock: (instanceId) => {
    set({ selectedBlockId: instanceId });
  },

  // Mark as saved
  markSaved: () => {
    set({ isDirty: false });
  },

  // Set saving status
  setSaving: (saving) => {
    set({ isSaving: saving });
  },

  // Get blocks for current page
  getCurrentPageBlocks: () => {
    const { currentPage, pageLayouts } = get();
    return pageLayouts[currentPage]?.blocks || [];
  },

  // Get selected block
  getSelectedBlock: () => {
    const { selectedBlockId, currentPage, pageLayouts } = get();
    if (!selectedBlockId) return null;
    const blocks = pageLayouts[currentPage]?.blocks || [];
    return blocks.find((b) => b.instanceId === selectedBlockId) || null;
  },
}));
