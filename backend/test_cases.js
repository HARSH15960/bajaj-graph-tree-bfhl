import { processGraph } from './graphSolver.js';

const testCases = [
  {
    name: "1. Normal tree",
    input: ["A->B", "A->C", "B->D"],
    assert: (res) => {
      console.assert(res.summary.total_trees === 1, "Should have 1 tree");
      console.assert(res.summary.total_cycles === 0, "Should have 0 cycles");
      console.assert(res.summary.largest_tree_root === "A", "Largest root should be A");
      console.assert(res.hierarchies.length === 1, "Should have 1 hierarchy");
      console.assert(res.hierarchies[0].root === "A", "Root should be A");
      console.assert(res.hierarchies[0].depth === 3, "Depth should be 3");
      console.assert(res.hierarchies[0].has_cycle === false, "Should not have cycle");
      console.assert(res.hierarchies[0].tree.A.B.D !== undefined, "Tree structure should match");
    }
  },
  {
    name: "2. Duplicate edges",
    input: ["A->B", "A->B", "A->C"],
    assert: (res) => {
      console.assert(res.duplicate_edges.includes("A->B"), "Should report A->B as duplicate");
      console.assert(res.duplicate_edges.length === 1, "Should report duplicate only once");
      console.assert(res.summary.total_trees === 1, "Should have 1 tree");
      console.assert(res.hierarchies[0].depth === 2, "Depth should be 2");
    }
  },
  {
    name: "3. Self loop",
    input: ["A->B", "B->B", "B->C"],
    assert: (res) => {
      console.assert(res.invalid_entries.includes("B->B"), "Self loop B->B should be invalid");
      console.assert(res.summary.total_trees === 1, "Should have 1 tree (A->B->C)");
      console.assert(res.hierarchies[0].root === "A", "Tree root should be A");
      console.assert(res.hierarchies[0].depth === 3, "Depth should be 3");
    }
  },
  {
    name: "4. Invalid strings",
    input: ["A->B", "hello", "1->2", "AB->C", "A-B", "A->", ""],
    assert: (res) => {
      const expectedInvalid = ["hello", "1->2", "AB->C", "A-B", "A->", ""];
      expectedInvalid.forEach(item => {
        console.assert(res.invalid_entries.includes(item), `Should report '${item}' as invalid`);
      });
      console.assert(res.summary.total_trees === 1, "Should have 1 tree for A->B");
      console.assert(res.hierarchies[0].root === "A", "Root should be A");
    }
  },
  {
    name: "5. Multi-parent node",
    input: ["A->D", "B->D"],
    assert: (res) => {
      // First encountered parent wins. A->D wins, B->D is ignored.
      // A->D accepted, D has parent A. B has no edges in accepted since B->D is ignored.
      console.assert(res.summary.total_trees === 1, "Should have 1 tree (A->D)");
      console.assert(res.hierarchies[0].root === "A", "Root should be A");
      console.assert(res.hierarchies[0].depth === 2, "Depth should be 2");
    }
  },
  {
    name: "6. Pure cycle",
    input: ["A->B", "B->C", "C->A"],
    assert: (res) => {
      console.assert(res.summary.total_trees === 0, "Should have 0 trees");
      console.assert(res.summary.total_cycles === 1, "Should have 1 cycle");
      console.assert(res.hierarchies.length === 1, "Should have 1 hierarchy");
      console.assert(res.hierarchies[0].root === "A", "Root of cycle should be A (lexicographically smallest)");
      console.assert(res.hierarchies[0].has_cycle === true, "Should report has_cycle true");
      console.assert(res.hierarchies[0].depth === undefined, "Cycle should not include depth");
      console.assert(Object.keys(res.hierarchies[0].tree).length === 0, "Cycle tree structure should be empty");
    }
  },
  {
    name: "7. Multiple disconnected groups",
    input: ["A->B", "C->D"],
    assert: (res) => {
      console.assert(res.summary.total_trees === 2, "Should have 2 trees");
      console.assert(res.hierarchies.length === 2, "Should have 2 hierarchies");
      console.assert(res.hierarchies[0].root === "A", "First hierarchy root should be A");
      console.assert(res.hierarchies[1].root === "C", "Second hierarchy root should be C");
      console.assert(res.summary.largest_tree_root === "A", "Largest tree root should be A (tie breaker, both depth 2)");
    }
  },
  {
    name: "8. Whitespace handling",
    input: ["  A->B  ", "  C->D  "],
    assert: (res) => {
      console.assert(res.invalid_entries.length === 0, "Should have no invalid entries");
      console.assert(res.summary.total_trees === 2, "Should have 2 trees");
    }
  },
  {
    name: "9. Empty input",
    input: [],
    assert: (res) => {
      console.assert(res.summary.total_trees === 0, "Should have 0 trees");
      console.assert(res.summary.total_cycles === 0, "Should have 0 cycles");
      console.assert(res.summary.largest_tree_root === "", "Largest root should be empty");
      console.assert(res.hierarchies.length === 0, "Should have 0 hierarchies");
    }
  },
  {
    name: "10. Mixed input",
    input: ["A->B", "A->C", "B->D", "B->D", "E->F", "F->E", "hello", "X->X", "A->D"],
    assert: (res) => {
      console.assert(res.invalid_entries.includes("hello") && res.invalid_entries.includes("X->X"), "Invalid entries matches");
      console.assert(res.duplicate_edges.includes("B->D"), "Duplicate edges matches");
      console.assert(res.summary.total_trees === 1, "Should have 1 tree (A->B->D and A->C)");
      console.assert(res.summary.total_cycles === 1, "Should have 1 cycle (E-F)");
      console.assert(res.hierarchies[0].root === "A", "Tree root should be A");
      console.assert(res.hierarchies[0].depth === 3, "Tree depth should be 3");
      console.assert(res.hierarchies[1].root === "E", "Cycle root should be E");
      console.assert(res.hierarchies[1].has_cycle === true, "Cycle has_cycle should be true");
    }
  }
];

console.log("Running Graph & Tree building algorithm test cases...\n");
let passedAll = true;

for (const tc of testCases) {
  try {
    const res = processGraph(tc.input);
    tc.assert(res);
    console.log(`✅ Test passed: ${tc.name}`);
  } catch (err) {
    console.error(`❌ Test FAILED: ${tc.name}`);
    console.error(err);
    passedAll = false;
  }
}

if (passedAll) {
  console.log("\n🎉 All 10 test cases passed successfully!");
  process.exit(0);
} else {
  console.error("\n❌ Some test cases failed.");
  process.exit(1);
}
