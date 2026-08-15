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
  spouseOfId?: number;
  isSpouse?: boolean;
}

export interface OrganicLayoutResult {
  nodes: OrganicTreeNode[];
  rootNode: OrganicTreeNode | null;
  width: number;
  height: number;
}

/**
 * Calculates organic growing tree positions, Bezier curved branch paths,
 * branch thicknesses, and staggered growth animation delays for any arbitrary family structure.
 */
export function calculateOrganicLayout(
  people: Person[],
  relationships: Relationship[]
): OrganicLayoutResult {
  if (!people || people.length === 0) {
    return { nodes: [], rootNode: null, width: 800, height: 600 };
  }

  const personById: Record<number, Person> = {};
  people.forEach((p) => (personById[p.id] = p));

  // 1. Build relational maps
  const childrenMap: Record<number, number[]> = {};
  const parentMap: Record<number, number[]> = {};
  const spousesMap: Record<number, number[]> = {};
  const siblingsMap: Record<number, number[]> = {};

  relationships.forEach((rel) => {
    let pId: number | null = null;
    let cId: number | null = null;

    if (rel.relationship_type === 'parent') {
      pId = rel.person_1_id;
      cId = rel.person_2_id;
    } else if (rel.relationship_type === 'child') {
      pId = rel.person_2_id;
      cId = rel.person_1_id;
    }

    if (pId && cId) {
      if (!childrenMap[pId]) childrenMap[pId] = [];
      if (!childrenMap[pId].includes(cId)) childrenMap[pId].push(cId);

      if (!parentMap[cId]) parentMap[cId] = [];
      if (!parentMap[cId].includes(pId)) parentMap[cId].push(pId);
    }

    if (rel.relationship_type === 'spouse') {
      if (!spousesMap[rel.person_1_id]) spousesMap[rel.person_1_id] = [];
      if (!spousesMap[rel.person_1_id].includes(rel.person_2_id)) spousesMap[rel.person_1_id].push(rel.person_2_id);

      if (!spousesMap[rel.person_2_id]) spousesMap[rel.person_2_id] = [];
      if (!spousesMap[rel.person_2_id].includes(rel.person_1_id)) spousesMap[rel.person_2_id].push(rel.person_1_id);
    }

    if (rel.relationship_type === 'sibling') {
      if (!siblingsMap[rel.person_1_id]) siblingsMap[rel.person_1_id] = [];
      if (!siblingsMap[rel.person_1_id].includes(rel.person_2_id)) siblingsMap[rel.person_1_id].push(rel.person_2_id);

      if (!siblingsMap[rel.person_2_id]) siblingsMap[rel.person_2_id] = [];
      if (!siblingsMap[rel.person_2_id].includes(rel.person_1_id)) siblingsMap[rel.person_2_id].push(rel.person_1_id);
    }
  });

  // Link children of spouse to both parents
  people.forEach((p) => {
    const spouses = spousesMap[p.id] || [];
    spouses.forEach((sId) => {
      const ownChildren = childrenMap[p.id] || [];
      const spouseChildren = childrenMap[sId] || [];
      const combined = Array.from(new Set([...ownChildren, ...spouseChildren]));
      childrenMap[p.id] = combined;
      childrenMap[sId] = combined;
    });
  });

  // 2. Identify all Root Ancestors (people without registered parents)
  const rootPeople = people.filter(
    (p) => (!parentMap[p.id] || parentMap[p.id].length === 0)
  );

  // If every person has a parent (e.g. loops or cyclic mock), pick the oldest or first
  const effectiveRoots = rootPeople.length > 0 ? rootPeople : [people[0]];

  const visited = new Set<number>();
  const NODE_SPACING_X = 220;
  const LEVEL_HEIGHT = 170;
  const TRUNK_BASE_Y = 500;

  // 3. Build recursive hierarchy
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
      branchThickness: Math.max(4, 14 - gen * 2.2),
      delay: gen * 0.45,
      subTreeWidth: 0,
    };
  }

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

  // Build forest of all root trees
  const rootHierarchies: OrganicTreeNode[] = [];
  effectiveRoots.forEach((rp) => {
    if (!visited.has(rp.id) && personById[rp.id]) {
      const tree = buildHierarchyNode(personById[rp.id], 1);
      computeSubtreeWidth(tree);
      rootHierarchies.push(tree);
    }
  });

  // If there are still unvisited people (e.g. disconnected nodes or orphan branches), build trees for them too!
  people.forEach((p) => {
    if (!visited.has(p.id)) {
      const tree = buildHierarchyNode(p, 1);
      computeSubtreeWidth(tree);
      rootHierarchies.push(tree);
    }
  });

  // 4. Assign Coordinates (X, Y) and Bezier branch paths
  const allNodes: OrganicTreeNode[] = [];

  function assignPositions(
    node: OrganicTreeNode,
    currentX: number,
    depth: number,
    pX?: number,
    pY?: number
  ) {
    node.x = currentX;
    node.y = TRUNK_BASE_Y - (depth - 1) * LEVEL_HEIGHT;
    node.parentX = pX;
    node.parentY = pY;

    // Organic Bezier curve from parent branch to child node
    if (pX != null && pY != null) {
      const startX = pX;
      const startY = pY;
      const endX = node.x;
      const endY = node.y;

      const curveOffset = (endX - startX) * 0.35;
      const control1X = startX + curveOffset;
      const control1Y = startY - 45;
      const control2X = endX - curveOffset;
      const control2Y = endY + 45;

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

  // Layout all root trees side-by-side centered at X = 0
  let totalForestWidth = 0;
  rootHierarchies.forEach((rh) => (totalForestWidth += rh.subTreeWidth));

  let currentRootX = -totalForestWidth / 2;
  rootHierarchies.forEach((rh, idx) => {
    const rootCenterX = currentRootX + rh.subTreeWidth / 2;
    assignPositions(rh, rootCenterX, 1);

    // If multiple root trees, connect each root to the central trunk base
    if (rootHierarchies.length > 1 && rootCenterX !== 0) {
      const trunkX = 0;
      const trunkY = TRUNK_BASE_Y + 50;
      rh.parentX = trunkX;
      rh.parentY = trunkY;
      rh.branchPath = `M ${trunkX} ${trunkY} C ${trunkX + (rootCenterX - trunkX) * 0.4} ${trunkY - 20}, ${rootCenterX - (rootCenterX - trunkX) * 0.3} ${rh.y + 30}, ${rootCenterX} ${rh.y}`;
      rh.delay = idx * 0.2;
    }

    currentRootX += rh.subTreeWidth;
  });

  // Calculate total canvas bounds
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
    rootNode: rootHierarchies[0] || null,
    width,
    height,
  };
}
