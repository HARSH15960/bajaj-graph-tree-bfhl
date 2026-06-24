// Main graph processing algorithm
export function processGraph(data) {
  const invalid_entries = [];
  const duplicate_edges = [];
  const accepted_edges = []; // list of [u, v]
  const seen_edges = new Set();
  const child_to_parent = new Map(); // to enforce multi-parent rule: child -> parent

  if (!data || !Array.isArray(data)) {
    return {
      hierarchies: [],
      invalid_entries: [],
      duplicate_edges: [],
      summary: {
        total_trees: 0,
        total_cycles: 0,
        largest_tree_root: ""
      }
    };
  }

  // 1. Validation & Deduplication & Multi-parent resolution
  for (const item of data) {
    if (typeof item !== 'string') {
      invalid_entries.push(String(item));
      continue;
    }
    const trimmed = item.trim();
    
    // Validate format X->Y where X and Y are uppercase letters
    const match = trimmed.match(/^([A-Z])->([A-Z])$/);
    if (!match) {
      invalid_entries.push(trimmed);
      continue;
    }

    const u = match[1];
    const v = match[2];

    // Self loops are invalid (e.g. A->A)
    if (u === v) {
      invalid_entries.push(trimmed);
      continue;
    }

    const edgeStr = `${u}->${v}`;

    // Duplicate check
    if (seen_edges.has(edgeStr)) {
      if (!duplicate_edges.includes(edgeStr)) {
        duplicate_edges.push(edgeStr);
      }
      continue;
    }
    seen_edges.add(edgeStr);

    // Multi-parent check (First encountered parent wins)
    if (child_to_parent.has(v)) {
      // Discard silently
      continue;
    }
    child_to_parent.set(v, u);
    accepted_edges.push([u, v]);
  }

  // 2. Build adjacency lists and identify all unique nodes
  const nodes = new Set();
  const adj = {}; // parent -> list of children
  const inDegrees = {}; // node -> in-degree count

  for (const [u, v] of accepted_edges) {
    nodes.add(u);
    nodes.add(v);
    if (!adj[u]) adj[u] = [];
    adj[u].push(v);

    if (inDegrees[u] === undefined) inDegrees[u] = 0;
    if (inDegrees[v] === undefined) inDegrees[v] = 0;
    inDegrees[v]++;
  }

  // 3. Find weakly connected components
  // Build undirected adjacency list for BFS
  const undirectedAdj = {};
  for (const node of nodes) {
    undirectedAdj[node] = [];
  }
  for (const [u, v] of accepted_edges) {
    undirectedAdj[u].push(v);
    undirectedAdj[v].push(u);
  }

  const visited = new Set();
  const components = [];

  for (const node of nodes) {
    if (!visited.has(node)) {
      const compNodes = [];
      const queue = [node];
      visited.add(node);
      while (queue.length > 0) {
        const curr = queue.shift();
        compNodes.push(curr);
        for (const neighbor of undirectedAdj[curr]) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      components.push(compNodes);
    }
  }

  // 4. Analyze each component
  const hierarchies = [];
  let total_trees = 0;
  let total_cycles = 0;
  let largest_tree_root = "";
  let largest_tree_depth = -1;

  for (const compNodes of components) {
    // Find nodes in this component with in-degree 0
    const compRoots = compNodes.filter(node => (inDegrees[node] || 0) === 0);

    if (compRoots.length === 1) {
      // It is a Tree!
      const root = compRoots[0];

      // Recursively build tree representation
      const buildTree = (curr) => {
        const treeObj = {};
        const children = adj[curr] || [];
        // Sort children lexicographically for deterministic output
        const sortedChildren = [...children].sort();
        for (const child of sortedChildren) {
          treeObj[child] = buildTree(child);
        }
        return treeObj;
      };

      // Recursively find depth
      const getDepth = (curr) => {
        const children = adj[curr] || [];
        if (children.length === 0) return 1;
        let maxChildDepth = 0;
        for (const child of children) {
          maxChildDepth = Math.max(maxChildDepth, getDepth(child));
        }
        return 1 + maxChildDepth;
      };

      const depth = getDepth(root);
      const treeStructure = {
        [root]: buildTree(root)
      };

      hierarchies.push({
        root,
        tree: treeStructure,
        depth
      });

      total_trees++;

      // Update largest tree tracker
      if (depth > largest_tree_depth) {
        largest_tree_depth = depth;
        largest_tree_root = root;
      } else if (depth === largest_tree_depth) {
        // Tie breaker: lexicographically smaller root
        if (root < largest_tree_root) {
          largest_tree_root = root;
        }
      }
    } else {
      // It has a cycle (roots.length === 0)
      const root = [...compNodes].sort()[0]; // lexicographically smallest node in component
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true
      });
      total_cycles++;
    }
  }

  // Sort hierarchies by root lexicographically
  hierarchies.sort((a, b) => a.root.localeCompare(b.root));

  return {
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
      total_trees,
      total_cycles,
      largest_tree_root
    }
  };
}
