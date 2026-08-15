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
  isUnattached?: boolean;
}

export interface OrganicLayoutResult {
  nodes: OrganicTreeNode[];
  rootNode: OrganicTreeNode | null;
  width: number;
  height: number;
  unattachedCount: number;
}

/**
 * Calculates organic growing tree positions, Bezier curved branch paths,
 * branch thicknesses, and staggered growth animation delays.
 * Unattached/newly added members stay in a designated ground area below the tree
 * until relationships are added to integrate them into branches.
 */
export function calculateOrganicLayout(
  people: Person[],
  relationships: Relationship[]
): OrganicLayoutResult {
  if (!people || people.length === 0) {
    return { nodes: [], rootNode: null, width: 800, height: 600, unattachedCount: 0 };
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

  // 2. Classify connected members vs standalone/unattached members
  const hasAnyRelationshipsInFamily = relationships.length > 0;

  const connectedPeople: Person[] = [];
  const unattachedPeople: Person[] = [];

  people.forEach((p) => {
    const hasRel =
      (parentMap[p.id]?.length ?? 0) > 0 ||
      (childrenMap[p.id]?.length ?? 0) > 0 ||
      (spousesMap[p.id]?.length ?? 0) > 0 ||
      (siblingsMap[p.id]?.length ?? 0) > 0;

    // If family has no relationships yet and there's 1 person, that 1 person is the root founder
    if (hasRel || (!hasAnyRelationshipsInFamily && people.length === 1)) {
      connectedPeople.push(p);
    } else {
      unattachedPeople.push(p);
    }
  });

  // 3. Identify Root Ancestors in connected pool
  const rootPeople = connectedPeople.filter(
    (p) => (!parentMap[p.id] || parentMap[p.id].length === 0)
  );

  const effectiveRoots = rootPeople.length > 0 ? rootPeople : (connectedPeople.length > 0 ? [connectedPeople[0]] : []);

  const visited = new Set<number>();
  const NODE_SPACING_X = 220;
  const LEVEL_HEIGHT = 170;
  const TRUNK_BASE_Y = 480;

  // 4. Build recursive hierarchy for connected members
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
      delay: gen * 0.4,
      subTreeWidth: 0,
      isUnattached: false,
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

  // Also include any other connected people that might be in secondary connected subgraphs
  connectedPeople.forEach((p) => {
    if (!visited.has(p.id)) {
      const tree = buildHierarchyNode(p, 1);
      computeSubtreeWidth(tree);
      rootHierarchies.push(tree);
    }
  });

  // 5. Assign Coordinates (X, Y) and Bezier branch paths
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

  // 6. Position UNATTACHED / STANDALONE members at the bottom below the tree
  const UNATTACHED_SPACING_X = 160;
  const UNATTACHED_Y = TRUNK_BASE_Y + 130;

  unattachedPeople.forEach((up, idx) => {
    const unattachedX = (idx - (unattachedPeople.length - 1) / 2) * UNATTACHED_SPACING_X;
    const standaloneNode: OrganicTreeNode = {
      person: up,
      children: [],
      generation: 0,
      x: unattachedX,
      y: UNATTACHED_Y,
      branchThickness: 0,
      delay: 0.2,
      subTreeWidth: UNATTACHED_SPACING_X,
      isUnattached: true,
    };
    allNodes.push(standaloneNode);
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
    unattachedCount: unattachedPeople.length,
  };
}
