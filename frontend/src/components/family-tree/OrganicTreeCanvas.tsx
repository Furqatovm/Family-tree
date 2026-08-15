import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Play, Compass, Move, Sparkles } from 'lucide-react';
import { Person, Relationship } from '../../types';
import { calculateOrganicLayout, OrganicTreeNode } from '../../lib/organicTreeLayout';
import { OrganicPersonNode } from './OrganicPersonNode';
import { Button } from '../ui/Button';

interface OrganicTreeCanvasProps {
  people: Person[];
  relationships: Relationship[];
  onSelectPerson: (person: Person | null) => void;
  selectedPersonId: number | null;
}

export const OrganicTreeCanvas: React.FC<OrganicTreeCanvasProps> = ({
  people,
  relationships,
  onSelectPerson,
  selectedPersonId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [hoveredPersonId, setHoveredPersonId] = useState<number | null>(null);

  // Calculate layout
  const layout = useMemo(
    () => calculateOrganicLayout(people, relationships),
    [people, relationships]
  );

  // Calculate dynamic center and fitting scale for the tree
  const { centerX, centerY, autoScale } = useMemo(() => {
    if (!layout.nodes || layout.nodes.length === 0) {
      return { centerX: 0, centerY: 350, autoScale: 0.85 };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    layout.nodes.forEach((n: OrganicTreeNode) => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const treeHeight = maxY - minY + 260;
    const treeWidth = maxX - minX + 340;

    const vh = typeof window !== 'undefined' ? window.innerHeight - 180 : 700;
    const vw = typeof window !== 'undefined' ? window.innerWidth - 360 : 1000;

    const fitScale = Math.min(
      1.0,
      Math.max(0.6, Math.min(vh / Math.max(treeHeight, 350), vw / Math.max(treeWidth, 500)))
    );

    return { centerX: midX, centerY: midY, autoScale: fitScale };
  }, [layout.nodes]);

  // Pan and Zoom viewport state initialized directly to tree center
  const [scale, setScale] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Auto-center and fit view when nodes load or layout updates
  useEffect(() => {
    if (layout.nodes && layout.nodes.length > 0) {
      setPan({ x: -centerX, y: -centerY });
      setScale(autoScale);
    }
  }, [centerX, centerY, autoScale, layout.nodes.length]);

  // Calculate highlighted ancestor path IDs when a person is hovered
  const highlightedPersonIds = useMemo(() => {
    if (!hoveredPersonId) return new Set<number>();

    const set = new Set<number>();
    const parentMap: Record<number, number[]> = {};

    relationships.forEach((rel) => {
      if (rel.relationship_type === 'parent') {
        if (!parentMap[rel.person_2_id]) parentMap[rel.person_2_id] = [];
        parentMap[rel.person_2_id].push(rel.person_1_id);
      }
    });

    let current: number | undefined = hoveredPersonId;
    while (current) {
      set.add(current);
      const parents: number[] | undefined = parentMap[current];
      if (parents && parents.length > 0) {
        current = parents[0];
      } else {
        break;
      }
    }

    return set;
  }, [hoveredPersonId, relationships]);

  // Handle Mouse Pan Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.group')) return; // Ignore node clicks
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom handlers
  const handleZoomIn = () => setScale((s) => Math.min(1.6, s + 0.15));
  const handleZoomOut = () => setScale((s) => Math.max(0.3, s - 0.15));
  const handleResetView = () => {
    setScale(autoScale);
    setPan({ x: -centerX, y: -centerY });
  };

  const handleReplayAnimation = () => {
    setAnimationKey((k) => k + 1);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
    setScale((s) => Math.min(2.0, Math.max(0.3, s + zoomDelta)));
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className="w-full h-full relative overflow-hidden bg-white select-none cursor-grab active:cursor-grabbing"
    >
      {/* Floating Canvas Controls */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#E7E5E4] shadow-card">
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          leftIcon={<Play className="w-3.5 h-3.5 text-[#3F6B4F]" />}
          onClick={handleReplayAnimation}
          title="Replay Organic Tree Growth Animation"
        >
          Replay Growth
        </Button>

        <div className="h-4 w-px bg-[#E7E5E4]" />

        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl hover:bg-stone-100 text-[#1C1917]"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl hover:bg-stone-100 text-[#1C1917]"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={handleResetView}
          className="p-2 rounded-xl hover:bg-stone-100 text-[#1C1917]"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Animated Organic Tree World Container */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <AnimatePresence mode="wait">
          <div key={animationKey} className="relative">
            {/* SVG Layer for Curved Wood Branches & Leaves */}
            <svg
              className="absolute overflow-visible pointer-events-none"
              style={{
                left: 0,
                top: 0,
                width: 1,
                height: 1,
              }}
            >
              <defs>
                {/* Wood Bark Gradient */}
                <linearGradient id="branchWoodGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#4A2E1B" />
                  <stop offset="50%" stopColor="#6B4226" />
                  <stop offset="100%" stopColor="#3F6B4F" />
                </linearGradient>

                {/* Highlight Active Path Gradient */}
                <linearGradient id="highlightBranchGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#22C55E" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>



              {/* Main Trunk Base Animation at Root */}
              {layout.rootNode && (
                <motion.g
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ duration: 0.6 }}
                  style={{ transformOrigin: 'bottom center' }}
                >
                  {/* Root Trunk Pillar */}
                  <path
                    d={`M ${layout.rootNode.x} ${layout.rootNode.y + 60} Q ${layout.rootNode.x - 10} ${layout.rootNode.y + 30}, ${layout.rootNode.x} ${layout.rootNode.y}`}
                    stroke="url(#branchWoodGradient)"
                    strokeWidth={16}
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Root Soil Mound Accent */}
                  <ellipse
                    cx={layout.rootNode.x}
                    cy={layout.rootNode.y + 65}
                    rx={30}
                    ry={10}
                    fill="#4A2E1B"
                    opacity={0.3}
                  />
                </motion.g>
              )}

              {/* Curved SVG Branches for Each Generation */}
              {layout.nodes.map((node: OrganicTreeNode) => {
                if (!node.branchPath) return null;

                const isPathHighlighted =
                  highlightedPersonIds.has(node.person.id) &&
                  node.parentX != null &&
                  node.person.id !== hoveredPersonId;

                return (
                  <g key={`branch-${node.person.id}`}>
                    {/* Outer Shadow Branch */}
                    <motion.path
                      d={node.branchPath}
                      fill="none"
                      stroke="rgba(0, 0, 0, 0.08)"
                      strokeWidth={node.branchThickness + 4}
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        duration: 0.8,
                        delay: node.delay,
                        ease: 'easeInOut',
                      }}
                    />

                    {/* Main Wood Branch Path */}
                    <motion.path
                      d={node.branchPath}
                      fill="none"
                      stroke={isPathHighlighted ? '#22C55E' : 'url(#branchWoodGradient)'}
                      strokeWidth={isPathHighlighted ? node.branchThickness + 4 : node.branchThickness}
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        duration: 0.8,
                        delay: node.delay,
                        ease: 'easeInOut',
                      }}
                      style={{
                        filter: isPathHighlighted ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.8))' : 'none',
                      }}
                    />

                    {/* Leaf Sprouts Accents on Branch Ends */}
                    <motion.g
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.9 }}
                      transition={{ delay: node.delay + 0.7, duration: 0.4 }}
                      transform={`translate(${node.x}, ${node.y + 10})`}
                    >
                      <path
                        d="M 0 0 C -6 -8, -12 -2, 0 8 C 12 -2, 6 -8, 0 0 Z"
                        fill="#3F6B4F"
                      />
                    </motion.g>
                  </g>
                );
              })}
            </svg>

            {/* HTML Layer: Animated Person Nodes */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
              }}
            >
              {layout.nodes.map((treeNode: OrganicTreeNode) => (
                <OrganicPersonNode
                  key={`person-${treeNode.person.id}`}
                  treeNode={treeNode}
                  isSelected={selectedPersonId === treeNode.person.id}
                  isHighlighted={highlightedPersonIds.has(treeNode.person.id)}
                  onSelect={(p) => onSelectPerson(p)}
                  onHover={(id) => setHoveredPersonId(id)}
                />
              ))}
            </div>

            {/* Unattached Nursery Section Indicator */}
            {layout.unattachedCount > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 545,
                  transform: 'translateX(-50%)',
                }}
                className="pointer-events-none flex flex-col items-center gap-1 select-none"
              >
                <div className="w-80 border-t border-dashed border-amber-300" />
                <span className="bg-amber-50/95 text-amber-900 border border-amber-200/90 px-3 py-0.5 rounded-full text-[10px] font-serif font-semibold flex items-center gap-1 shadow-sm">
                  <span>🌱</span> Yangi a'zolar (Qarindoshlik bog'langanda daraxt shoxiga o'tadi)
                </span>
              </div>
            )}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};
