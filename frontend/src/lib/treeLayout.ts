import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';
import { Person } from '../types';

const NODE_WIDTH = 260;
const NODE_HEIGHT = 120;

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  generationFilter: number | 'all' = 'all'
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Set layout options for vertical family tree hierarchy
  dagreGraph.setGraph({
    rankdir: 'TB', // Top to bottom
    nodesep: 60,   // Horizontal spacing between siblings/couples
    ranksep: 110,  // Vertical spacing between generations
    align: 'DL',
  });

  // Filter nodes based on selected generation depth if requested
  let filteredNodes = nodes;
  if (generationFilter !== 'all') {
    const maxGen = typeof generationFilter === 'number' ? generationFilter : 99;
    filteredNodes = nodes.filter((n) => {
      const person = n.data as unknown as Person;
      return (person.generation || 1) <= maxGen;
    });
  }

  const validNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = edges.filter(
    (e) => validNodeIds.has(e.source) && validNodeIds.has(e.target)
  );

  // Add nodes to dagre
  filteredNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Add parent-child edges to dagre for rank calculation (ignore spouse edges for vertical rank)
  filteredEdges.forEach((edge) => {
    if (edge.type === 'parentChildEdge') {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  // Calculate new positions
  const layoutedNodes: Node[] = filteredNodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges: filteredEdges,
  };
};
