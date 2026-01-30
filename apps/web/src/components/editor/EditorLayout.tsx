import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useEditorStore } from '@/stores/editorStore';
import type { BlockTypeDefinition, PageLayouts } from '@affiliate/shared';
import { BlockPalette } from './BlockPalette';
import { EditorCanvas } from './EditorCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { PageSwitcher } from './PageSwitcher';
import { getBlockComponent } from './blocks';
import { EditorProvider, type ProjectContext } from './EditorContext';

interface LayoutResponse {
  pageLayouts: PageLayouts;
  selectedPages: string[];
}

interface ProjectResponse {
  id: string;
  brandName: string;
  brandDescription: string | null;
  brandColors: string;
  logoUrl: string | null;
  products: Array<{
    id: string;
    asin: string;
    title: string | null;
    customTitle: string | null;
    customDescription: string | null;
    imageUrl: string | null;
    generatedTitle: string | null;
    generatedDescription: string | null;
  }>;
  ctas: Array<{
    id: string;
    name: string;
    label: string;
    style: string;
    linkType: string;
  }>;
}

export function EditorLayout() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const {
    currentPage,
    pageLayouts,
    availablePages,
    selectedBlockId,
    isDirty,
    isSaving,
    initEditor,
    setCurrentPage,
    addBlock,
    removeBlock,
    reorderBlocks,
    updateBlockProperties,
    selectBlock,
    markSaved,
    setSaving,
    getCurrentPageBlocks,
    getSelectedBlock,
  } = useEditorStore();

  // Fetch block definitions
  const { data: blockDefinitions = [] } = useQuery<BlockTypeDefinition[]>({
    queryKey: ['blocks'],
    queryFn: () => api.get('/blocks'),
  });

  // Fetch project layout
  const { data: layoutData, isLoading: layoutLoading } = useQuery<LayoutResponse>({
    queryKey: ['project-layout', projectId],
    queryFn: () => api.get(`/projects/${projectId}/layout`),
    enabled: !!projectId,
  });

  // Fetch full project data for block previews
  const { data: projectData, isLoading: projectLoading } = useQuery<ProjectResponse>({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/projects/${projectId}`),
    enabled: !!projectId,
  });

  const isLoading = layoutLoading || projectLoading;

  // Transform project data for context
  const projectContext: ProjectContext | null = projectData
    ? {
        brandName: projectData.brandName,
        brandDescription: projectData.brandDescription,
        brandColors: JSON.parse(projectData.brandColors || '{"primary":"#2563eb","secondary":"#1e40af","accent":"#f59e0b"}'),
        logoUrl: projectData.logoUrl,
        products: projectData.products || [],
        ctas: projectData.ctas || [],
      }
    : null;

  // Initialize editor when data loads
  useEffect(() => {
    if (layoutData && projectId) {
      initEditor(projectId, layoutData.pageLayouts, layoutData.selectedPages);
    }
  }, [layoutData, projectId, initEditor]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (layouts: PageLayouts) =>
      api.put(`/projects/${projectId}/layout`, { pageLayouts: layouts }),
    onMutate: () => setSaving(true),
    onSuccess: () => {
      markSaved();
      queryClient.invalidateQueries({ queryKey: ['project-layout', projectId] });
      toast({ title: 'Saved', description: 'Layout saved successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save layout', variant: 'destructive' });
    },
    onSettled: () => setSaving(false),
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;

    if (!over) return;

    // Dropping from palette to canvas
    if (String(active.id).startsWith('palette-') && over.id === 'canvas') {
      const { blockType, defaultProperties } = active.data.current as {
        blockType: string;
        defaultProperties: Record<string, unknown>;
      };
      addBlock(blockType, defaultProperties);
      return;
    }

    // Reordering within canvas
    if (!String(active.id).startsWith('palette-') && active.id !== over.id) {
      const blocks = getCurrentPageBlocks();
      const oldIndex = blocks.findIndex((b) => b.instanceId === active.id);
      const newIndex = blocks.findIndex((b) => b.instanceId === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderBlocks(oldIndex, newIndex);
      }
    }
  };

  const selectedBlock = getSelectedBlock();
  const selectedBlockDef = selectedBlock
    ? blockDefinitions.find((b) => b.id === selectedBlock.blockType)
    : null;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Render drag overlay
  const renderDragOverlay = () => {
    if (!activeDragId) return null;

    if (activeDragId.startsWith('palette-')) {
      const blockType = activeDragId.replace('palette-', '');
      const def = blockDefinitions.find((b) => b.id === blockType);
      return (
        <div className="bg-white border-2 border-blue-400 rounded-lg p-4 shadow-lg opacity-80">
          {def?.name || blockType}
        </div>
      );
    }

    const block = getCurrentPageBlocks().find((b) => b.instanceId === activeDragId);
    if (block) {
      const BlockComponent = getBlockComponent(block.blockType);
      return (
        <div className="opacity-80 shadow-lg max-w-md">
          {BlockComponent && <BlockComponent properties={block.properties} />}
        </div>
      );
    }

    return null;
  };

  return (
    <EditorProvider project={projectContext}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="h-screen flex flex-col">
          {/* Header */}
          <header className="h-14 border-b bg-white flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${projectId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <PageSwitcher
                currentPage={currentPage}
                availablePages={availablePages}
                onChange={setCurrentPage}
              />
            </div>
            <div className="flex items-center gap-2">
              {isDirty && <span className="text-sm text-orange-500">Unsaved changes</span>}
              <Button
                size="sm"
                onClick={() => saveMutation.mutate(pageLayouts)}
                disabled={!isDirty || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </header>

          {/* Main editor area */}
          <div className="flex-1 flex overflow-hidden">
            <BlockPalette blocks={blockDefinitions} />
            <EditorCanvas
              blocks={getCurrentPageBlocks()}
              selectedBlockId={selectedBlockId}
              onSelectBlock={selectBlock}
              onDeleteBlock={removeBlock}
            />
            <PropertiesPanel
              block={selectedBlock}
              blockDefinition={selectedBlockDef ?? null}
              onUpdateProperties={(props) =>
                selectedBlockId && updateBlockProperties(selectedBlockId, props)
              }
            />
          </div>
        </div>

        <DragOverlay>{renderDragOverlay()}</DragOverlay>
      </DndContext>
    </EditorProvider>
  );
}
