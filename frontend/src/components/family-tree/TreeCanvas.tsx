import React, { useMemo, useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PersonNode } from './PersonNode';
import { SpouseEdge } from './SpouseEdge';
import { ParentChildEdge } from './ParentChildEdge';
import { OrganicTreeCanvas } from './OrganicTreeCanvas';
import { Person, Relationship } from '../../types';
import { Sprout, LayoutGrid } from 'lucide-react';

const nodeTypes = {
  personNode: PersonNode,
};

const edgeTypes = {
  spouseEdge: SpouseEdge,
  parentChildEdge: ParentChildEdge,
};

interface TreeCanvasProps {
  nodes: Node[];
  edges: Edge[];
  people?: Person[];
  relationships?: Relationship[];
  onSelectPerson: (person: Person | null) => void;
  selectedPersonId: number | null;
}

export const TreeCanvas: React.FC<TreeCanvasProps> = ({
  nodes: initialNodes,
  edges: initialEdges,
  people = [],
  relationships = [],
  onSelectPerson,
  selectedPersonId,
}) => {
  const [viewMode, setViewMode] = useState<'organic' | 'diagram'>('organic');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Extract raw people objects from nodes if not passed directly
  const extractedPeople: Person[] = useMemo(() => {
    if (people && people.length > 0) return people;
    return initialNodes.map((n) => n.data as unknown as Person);
  }, [people, initialNodes]);

  const extractedRelationships: Relationship[] = useMemo(() => {
    if (relationships && relationships.length > 0) return relationships;
    return initialEdges.map((e, idx) => ({
      id: idx + 1,
      family_id: 1,
      person_1_id: Number(e.source),
      person_2_id: Number(e.target),
      relationship_type: (e.data?.type as any) || 'parent',
    }));
  }, [relationships, initialEdges]);

  // Sync internal ReactFlow state when props update
  React.useEffect(() => {
    setNodes(
      initialNodes.map((node) => ({
        ...node,
        selected: String(selectedPersonId) === node.id,
      }))
    );
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, selectedPersonId, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const personData = node.data as unknown as Person;
      onSelectPerson(personData);
    },
    [onSelectPerson]
  );

  const onPaneClick = useCallback(() => {
    onSelectPerson(null);
  }, [onSelectPerson]);

  return (
    <div className="w-full h-full relative bg-[#FAFAF9]">
      {/* Top Floating View Switcher */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-30 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-[#E7E5E4] shadow-card">
        <button
          onClick={() => setViewMode('organic')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
            viewMode === 'organic'
              ? 'bg-[#3F6B4F] text-white shadow-sm'
              : 'text-[#78716C] hover:text-[#1C1917] hover:bg-stone-100'
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          <span className="hidden xs:inline sm:inline">Growing Tree</span>
          <span className="xs:hidden sm:hidden">Tree</span>
        </button>
        <button
          onClick={() => setViewMode('diagram')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
            viewMode === 'diagram'
              ? 'bg-[#3F6B4F] text-white shadow-sm'
              : 'text-[#78716C] hover:text-[#1C1917] hover:bg-stone-100'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span className="hidden xs:inline sm:inline">Diagram</span>
          <span className="xs:hidden sm:hidden">Grid</span>
        </button>
      </div>

      {viewMode === 'organic' ? (
        <OrganicTreeCanvas
          people={extractedPeople}
          relationships={extractedRelationships}
          onSelectPerson={onSelectPerson}
          selectedPersonId={selectedPersonId}
        />
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.8}
          defaultEdgeOptions={{ type: 'parentChildEdge' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E7E5E4" />
          <Controls className="!bg-white !border-[#E7E5E4] !shadow-subtle !rounded-xl" />
        </ReactFlow>
      )}
    </div>
  );
};
