import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { databaseService } from "./services/database";
import { aiService } from "./services/ai";
import { queryResultSchema, aiResponseSchema, insertQuerySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket for real-time AI chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('AI WebSocket client connected');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'ai_chat') {
          const response = await aiService.generateSQLQuery(message.content);
          
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'ai_response',
              data: response
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to process message'
          }));
        }
      }
    });
    
    ws.on('close', () => {
      console.log('AI WebSocket client disconnected');
    });
  });

  // Database routes
  app.get("/api/tables", async (req, res) => {
    try {
      const tables = await databaseService.getTables();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get("/api/tables/:name/schema", async (req, res) => {
    try {
      const { name } = req.params;
      const schema = await databaseService.getTableSchema(name);
      res.json(schema);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get("/api/tables/:name/data", async (req, res) => {
    try {
      const { name } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const result = await databaseService.getTableData(name, limit, offset);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/tables/:name/rows", async (req, res) => {
    try {
      const { name } = req.params;
      await databaseService.insertTableRow(name, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.put("/api/tables/:name/rows/:id", async (req, res) => {
    try {
      const { name, id } = req.params;
      await databaseService.updateTableRow(name, id, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/tables/:name/rows/:id", async (req, res) => {
    try {
      const { name, id } = req.params;
      await databaseService.deleteTableRow(name, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Query execution
  app.post("/api/query/execute", async (req, res) => {
    try {
      const { sql } = req.body;
      if (!sql || typeof sql !== 'string') {
        return res.status(400).json({ message: "SQL query is required" });
      }

      const result = await databaseService.executeQuery(sql);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // AI routes
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { prompt, tableSchema } = req.body;
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      const response = await aiService.generateSQLQuery(prompt, tableSchema);
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/ai/optimize", async (req, res) => {
    try {
      const { sqlQuery } = req.body;
      if (!sqlQuery) {
        return res.status(400).json({ message: "SQL query is required" });
      }

      const response = await aiService.optimizeQuery(sqlQuery);
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/ai/explain", async (req, res) => {
    try {
      const { sqlQuery } = req.body;
      if (!sqlQuery) {
        return res.status(400).json({ message: "SQL query is required" });
      }

      const response = await aiService.explainQuery(sqlQuery);
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Saved queries
  app.get("/api/queries", async (req, res) => {
    try {
      const queries = await storage.getQueries();
      res.json(queries);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/queries", async (req, res) => {
    try {
      const validatedData = insertQuerySchema.parse(req.body);
      const query = await storage.saveQuery(validatedData);
      res.json(query);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/queries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteQuery(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  return httpServer;
}
