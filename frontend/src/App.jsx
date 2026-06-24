import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// Recursive Tree Node Component
const TreeNode = ({ nodeName, childrenObj }) => {
  const childrenKeys = Object.keys(childrenObj);
  return (
    <div className="tree-node-wrapper">
      <div className="tree-node-content">
        <span className="node-icon">{nodeName}</span>
        <span className="node-name">{nodeName}</span>
      </div>
      {childrenKeys.map(childKey => (
        <TreeNode 
          key={childKey} 
          nodeName={childKey} 
          childrenObj={childrenObj[childKey]} 
        />
      ))}
    </div>
  );
};

// Tree Visualizer Root Component
const TreeVisualizer = ({ rootName, treeStructure }) => {
  const rootChildren = treeStructure[rootName] || {};
  const childrenKeys = Object.keys(rootChildren);

  return (
    <div className="tree-container">
      <div className="root-node-content">
        <span className="root-node-icon">{rootName}</span>
        <span className="root-node-name">{rootName} (Root)</span>
      </div>
      {childrenKeys.map(childKey => (
        <TreeNode 
          key={childKey} 
          nodeName={childKey} 
          childrenObj={rootChildren[childKey]} 
        />
      ))}
    </div>
  );
};

function App() {
  const [inputText, setInputText] = useState("A->B\nA->C\nB->D");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [activeTab, setActiveTab] = useState('visual');
  const [copied, setCopied] = useState(false);

  // Pre-fill templates to make testing extremely easy
  const templates = {
    normal: "A->B\nA->C\nB->D",
    cycle: "A->B\nB->C\nC->A",
    multiParent: "A->D\nB->D",
    duplicate: "A->B\nA->B\nA->C",
    disconnected: "A->B\nC->D\nE->F\nF->G",
    mixed: "A->B\nA->C\nB->D\nB->D\nE->F\nF->E\nhello\nX->X\nA->D"
  };

  const loadTemplate = (key) => {
    setInputText(templates[key]);
  };

  const getApiUrl = () => {
    if (import.meta.env.DEV) {
      return '/api'; // Use local Vite proxy
    }
    // In production, fallback to VITE_API_URL or a fallback Render domain
    return import.meta.env.VITE_API_URL || 'https://graph-tree-bfhl.onrender.com';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse(null);

    // Parse text input: split by newlines, trim, filter out empty lines
    const lines = inputText.split('\n');
    const data = lines
      .map(line => line.trim())
      .filter(line => line !== '');

    try {
      const url = `${getApiUrl()}/bfhl`;
      const res = await axios.post(url, { data });
      setResponse(res.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to connect to the server. Please verify the backend is running.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container animate-fade-in">
      <header className="app-header">
        <h1 className="app-title">Graph Tree & Cycle Parser</h1>
        <p className="app-subtitle">Build directed graphs, resolve multi-parents, construct trees, and detect cycles.</p>
      </header>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <span>Enter Node Connections</span>
              <span className="label-hint">One edge per line (e.g. X-&gt;Y)</span>
            </label>
            <textarea
              className="input-textarea"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="A->B&#10;A->C&#10;B->D"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '1rem' }}>Templates:</span>
            <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button type="button" className="tag" style={{ cursor: 'pointer' }} onClick={() => loadTemplate('normal')}>Normal Tree</button>
              <button type="button" className="tag" style={{ cursor: 'pointer' }} onClick={() => loadTemplate('cycle')}>Pure Cycle</button>
              <button type="button" className="tag" style={{ cursor: 'pointer' }} onClick={() => loadTemplate('multiParent')}>Multi-Parent</button>
              <button type="button" className="tag" style={{ cursor: 'pointer' }} onClick={() => loadTemplate('duplicate')}>Duplicates</button>
              <button type="button" className="tag" style={{ cursor: 'pointer' }} onClick={() => loadTemplate('disconnected')}>Disconnected</button>
              <button type="button" className="tag" style={{ cursor: 'pointer' }} onClick={() => loadTemplate('mixed')}>Mixed Case</button>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Processing Graph...
              </>
            ) : (
              'Parse & Generate Hierarchies'
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger animate-fade-in">
          <strong>Error: </strong> {error}
        </div>
      )}

      {response && (
        <div className="animate-fade-in">
          {/* Metadata banner */}
          <div className="meta-panel">
            <div className="meta-item">
              <span className="meta-label">User ID:</span>
              <span className="meta-val">{response.user_id}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Email ID:</span>
              <span className="meta-val">{response.email_id}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">College Roll Number:</span>
              <span className="meta-val">{response.college_roll_number}</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'visual' ? 'active' : ''}`}
              onClick={() => setActiveTab('visual')}
            >
              Visual Hierarchies
            </button>
            <button 
              className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              Summary Stats
            </button>
            <button 
              className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Edges & Validation
            </button>
            <button 
              className={`tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
              onClick={() => setActiveTab('raw')}
            >
              Raw JSON
            </button>
          </div>

          {/* Tab: Visual Hierarchies */}
          {activeTab === 'visual' && (
            <div className="card">
              <h2 style={{ marginBottom: '1.25rem', fontSize: '1.25rem' }}>Constructed Connected Components</h2>
              {response.hierarchies.length === 0 ? (
                <p className="empty-list-text">No valid hierarchies could be constructed from the input.</p>
              ) : (
                <div className="hierarchies-list">
                  {response.hierarchies.map((group, idx) => (
                    <div className="component-card" key={idx}>
                      <div className="component-header">
                        <span className="component-title">
                          Component Root: {group.root}
                        </span>
                        {group.has_cycle ? (
                          <span className="badge badge-cycle">Cycle Detected</span>
                        ) : (
                          <span className="badge badge-tree">Tree (Depth: {group.depth})</span>
                        )}
                      </div>
                      
                      {group.has_cycle ? (
                        <div className="alert alert-warning" style={{ margin: 0 }}>
                          This component is a cyclic group. A directed path cycles back, preventing tree hierarchical rendering.
                          Lexicographically smallest node <strong>{group.root}</strong> is chosen as the root.
                        </div>
                      ) : (
                        <TreeVisualizer rootName={group.root} treeStructure={group.tree} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Summary Stats */}
          {activeTab === 'summary' && (
            <div className="card">
              <h2 style={{ marginBottom: '1.25rem', fontSize: '1.25rem' }}>Graph Summary</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Total Connected Trees</span>
                  <span className="stat-value highlight-emerald">{response.summary.total_trees}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Total Cyclical Groups</span>
                  <span className="stat-value highlight-cyan">{response.summary.total_cycles}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Largest Tree Root</span>
                  <span className="stat-value highlight-indigo">
                    {response.summary.largest_tree_root || 'None'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Edges & Validation */}
          {activeTab === 'details' && (
            <div className="card">
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Edge Resolution Results</h2>
              
              <div className="list-group">
                <h3 className="list-group-title">
                  Duplicate Edges ({response.duplicate_edges.length})
                </h3>
                {response.duplicate_edges.length === 0 ? (
                  <p className="empty-list-text">No duplicate edges found.</p>
                ) : (
                  <div className="tag-list">
                    {response.duplicate_edges.map((edge, idx) => (
                      <span className="tag tag-duplicate" key={idx}>{edge}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="list-group">
                <h3 className="list-group-title">
                  Invalid Entries ({response.invalid_entries.length})
                </h3>
                {response.invalid_entries.length === 0 ? (
                  <p className="empty-list-text">No invalid entries encountered.</p>
                ) : (
                  <div className="tag-list">
                    {response.invalid_entries.map((entry, idx) => (
                      <span className="tag tag-invalid" key={idx}>
                        {entry === "" ? '"" (empty)' : entry}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Raw JSON */}
          {activeTab === 'raw' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Response JSON</h2>
                <button type="button" className="btn-submit" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={copyToClipboard}>
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
              <pre className="json-pre">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
