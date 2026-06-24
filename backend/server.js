import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { processGraph } from './graphSolver.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// POST endpoint
app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body;
    
    // We expect { data: [...] }
    if (!req.body || data === undefined) {
      return res.status(400).json({
        success: false,
        error: "Missing 'data' field in request body"
      });
    }

    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        error: "'data' field must be an array of strings"
      });
    }

    const result = processGraph(data);

    return res.json({
      user_id: "harshsingla_08072005",
      email_id: "harsh0765.be23@chitkara.edu.in",
      college_roll_number: "2310990765",
      ...result
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// GET endpoint (standard operation check)
app.get('/bfhl', (req, res) => {
  res.json({
    operation_code: 1
  });
});

// Root check endpoint
app.get('/', (req, res) => {
  res.send("BFHL Graph Tree API is running.");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
