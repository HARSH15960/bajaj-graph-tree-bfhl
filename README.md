# BFHL Graph Tree & Cycle Parser

A Full Stack Engineering Challenge Solution built using **Node.js, Express, React, and Vite**.

## Live Features

✅ Graph Parsing
✅ Tree Construction
✅ Cycle Detection
✅ Multi-Parent Resolution
✅ Duplicate Edge Detection
✅ Invalid Entry Validation
✅ Multiple Disconnected Components
✅ Hierarchical Visualization
✅ REST API + Frontend UI

---

# Problem Overview

The application accepts graph edges in the format:

```txt
A->B
A->C
B->D
```

and generates:

* Hierarchical tree structures
* Cycle detection results
* Invalid input reports
* Duplicate edge reports
* Summary statistics

---

# Architecture

```txt
Frontend (React + Vite)
          │
          ▼
POST /bfhl
          │
          ▼
Backend (Node.js + Express)
          │
          ▼
Graph Processing Engine
          │
 ┌────────┼────────┐
 ▼        ▼        ▼
Validation Tree   Cycle
Engine      Builder Detector
```

---

# Project Structure

```txt
GRAPH-TREE-BFHL
│
├── backend
│   ├── server.js
│   ├── graphSolver.js
│   ├── package.json
│   └── test_cases.js
│
├── frontend
│   ├── src
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json
│   └── package.json
│
└── README.md
```

---

# API Endpoint

## POST /bfhl

### Request

```json
{
  "data": [
    "A->B",
    "A->C",
    "B->D"
  ]
}
```

---

### Response

```json
{
  "user_id": "harshsingla_08072005",
  "email_id": "harsh0765.be23@chitkara.edu.in",
  "college_roll_number": "2310990765",
  "hierarchies": [
    {
      "root": "A",
      "tree": {
        "A": {
          "B": {
            "D": {}
          },
          "C": {}
        }
      },
      "depth": 3
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

---

# Graph Processing Rules

## Valid Edge

```txt
A->B
```

Rules:

* Parent must be a single uppercase letter.
* Child must be a single uppercase letter.

---

## Invalid Examples

```txt
hello
1->2
AB->C
A-B
A->
A->A
```

---

## Duplicate Edge Handling

Input:

```txt
A->B
A->B
A->B
```

Output:

```txt
duplicate_edges = ["A->B"]
```

---

## Multi Parent Resolution

Input:

```txt
A->D
B->D
```

Resolution:

```txt
A->D  ✓ accepted
B->D  ✗ ignored
```

First encountered parent wins.

---

## Cycle Detection

Input:

```txt
X->Y
Y->Z
Z->X
```

Output:

```json
{
  "root": "X",
  "tree": {},
  "has_cycle": true
}
```

---

# Example Visualization

```txt
A
├── B
│   └── D
└── C
    └── E
        └── F
```

Depth = 4

---

# Summary Statistics

The API returns:

```json
{
  "total_trees": 3,
  "total_cycles": 1,
  "largest_tree_root": "A"
}
```

---

# Running Locally

## Install Dependencies

```bash
npm install
```

---

## Start Development Server

```bash
npm run dev
```

Frontend:

```txt
http://localhost:3000
```

Backend:

```txt
http://localhost:5000
```

---

# Deployment

## Backend

Deploy using Render.

Build Command:

```bash
npm install
```

Start Command:

```bash
npm start
```

---

## Frontend

Deploy using Vercel.

Build Command:

```bash
npm run build
```

Output Directory:

```txt
dist
```

---

# Test Cases Covered

✅ Normal Tree

✅ Duplicate Edges

✅ Self Loops

✅ Invalid Inputs

✅ Multi Parent Nodes

✅ Pure Cycles

✅ Multiple Components

✅ Whitespace Handling

✅ Empty Input

✅ Mixed Inputs

---

# Tech Stack

### Frontend

* React
* Vite
* Axios
* CSS

### Backend

* Node.js
* Express.js
* CORS

---

# Author

**Harsh Singla**

Chitkara University

Roll Number: 2310990765
