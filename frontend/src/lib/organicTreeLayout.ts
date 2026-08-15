import { Person, Relationship } from '../types';

export interface OrganicTreeNode {
  person: Person;
  children: OrganicTreeNode[];
  generation: number;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
  branchPath?: string;
  branchThickness: number;
  delay: number;
  subTreeWidth: number;
}

export interface OrganicLayoutResult {
  nodes: OrganicTreeNode[];
  rootNode: OrganicTreeNode | null;
  width: number;
  height: number;
}

/**
 * Calculates organic growing tree positions, Bezier curved branch paths,
 * branch thicknesses, and staggered growth animation delays.
 */
export function calculateOrganicLayout(
  people: Person[],
  relationships: Relationship[]
): OrganicLayoutResult {
  if (!people || people.length === 0) {
    return { nodes: [], rootNode: null, width: 800, height: 600 };
  }

  // 1. Build parent-child relationships map
  const childrenMap: Record<number, number[]> = {};
  const parentMap: Record<number, number[]> = {};

  relationships.forEach((rel) => {
    if (rel.relationship_type === 'parent') {
      const parentId = rel.person_1_id;
      const childId = rel.person_2_id;
      if (!childrenMap[parentId]) childrenMap[parentId] = [];
      if (!childrenMap[parentId].includes(childId)) childrenMap[parentId].push(childId);

      if (!parentMap[childId]) parentMap[childId] = [];
      if (!parentMap[childId].includes(parentId)) parentMap[childId].push(parentId);
    }
  });

  const personById: Record<number, Person> = {};
  people.forEach((p) => (personById[p.id] = p));

  // 2. Find root person (lowest generation or person with no parents in data)
  let rootPerson = people.find((p) => !parentMap[p.id] || parentMap[p.id].length === 0);
  if (!rootPerson) {
    rootPerson = people[0];
  }

  // 3. Build recursive hierarchy tree
  const visited = new Set<number>();

  function buildHierarchyNode(person: Person, gen: number): OrganicTreeNode {
    visited.add(person.id);
    const childIds = childrenMap[person.id] || [];
    const childrenNodes: OrganicTreeNode[] = [];

    childIds.forEach((cId) => {
      if (!visited.has(cId) && personById[cId]) {
        childrenNodes.push(buildHierarchyNode(personById[cId], gen + 1));
      }
    });

    return {
      person,
      children: childrenNodes,
      generation: gen,
      x: 0,
      y: 0,
      branchThickness: Math.max(3, 12 - gen * 2.5),
      delay: gen * 0.7,
      subTreeWidth: 0,
    };
  }

  const rootHierarchy = buildHierarchyNode(rootPerson, 1);

  // 4. Calculate subtree widths to prevent overlapping
  const NODE_SPACING_X = 220; // Minimum horizontal distance between sibling nodes
  const LEVEL_HEIGHT = 160;  // Vertical distance between generation tiers

  function computeSubtreeWidth(node: OrganicTreeNode): number {
    if (node.children.length === 0) {
      node.subTreeWidth = NODE_SPACING_X;
      return NODE_SPACING_X;
    }

    let totalWidth = 0;
    node.children.forEach((child) => {
      totalWidth += computeSubtreeWidth(child);
    });

    node.subTreeWidth = Math.max(NODE_SPACING_X, totalWidth);
    return node.subTreeWidth;
  }

  computeSubtreeWidth(rootHierarchy);

  // 5. Assign coordinates (X, Y)
  const allNodes: OrganicTreeNode[] = [];
  const trunkBaseY = 500; // Base Y coordinate of tree root

  function assignPositions(
    node: OrganicTreeNode,
    currentX: number,
    depth: number,
    pX?: number,
    pY?: number
  ) {
    node.x = currentX;
    node.y = trunkBaseY - (depth - 1) * LEVEL_HEIGHT;
    node.parentX = pX;
    node.parentY = pY;

    // Create organic Bezier path from parent to child
    if (pX != null && pY != null) {
      const startX = pX;
      const startY = pY;
      const endX = node.x;
      const endY = node.y;

      // Natural organic curve calculation
      const midY = (startY + endY) / 2;
      const curveOffset = (endX - startX) * 0.3;

      const control1X = startX + curveOffset;
      const control1Y = startY - 40;
      const control2X = endX - curveOffset;
      const control2Y = endY + 40;

      node.branchPath = `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;
    }

    allNodes.push(node);

    if (node.children.length > 0) {
      let startChildX = currentX - node.subTreeWidth / 2;

      node.children.forEach((child) => {
        const childCenterX = startChildX + child.subTreeWidth / 2;
        assignPositions(child, childCenterX, depth + 1, node.x, node.y);
        startChildX += child.subTreeWidth;
      });
    }
  }

  // Root position centered at X = 0
  assignPositions(rootHierarchy, 0, 1);

  // Also include any disconnected people (orphans or separate families)
  people.forEach((p) => {
    if (!visited.has(p.id)) {
      const orphanNode: OrganicTreeNode = {
        person: p,
        children: [],
        generation: 1,
        x: (allNodes.length + 1) * 240,
        y: trunkBaseY,
        branchThickness: 6,
        delay: 0.5,
        subTreeWidth: NODE_SPACING_X,
      };
      allNodes.push(orphanNode);
    }
  });

  // Compute total canvas bounds
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  allNodes.forEach((n) => {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.y > maxY) maxY = n.y;
  });

  const width = Math.max(1200, maxX - minX + 600);
  const height = Math.max(900, maxY - minY + 600);

  return {
    nodes: allNodes,
    rootNode: rootHierarchy,
    width,
    height,
  };
}
