import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  const existingDevs = await storage.getDevelopers();
  if (existingDevs.length === 0) {
    const dev1 = await storage.createDeveloper({ name: "Alice Smith", email: "alice@example.com" });
    const dev2 = await storage.createDeveloper({ name: "Bob Jones", email: "bob@example.com" });
    const dev3 = await storage.createDeveloper({ name: "Charlie Brown", email: "charlie@example.com" });
    
    await storage.createBug({
      title: "Login page layout broken on mobile",
      description: "The login form fields overlap when viewing on screens smaller than 400px.",
      priority: "High",
      status: "Open",
      assigneeId: dev1.id,
    });
    
    await storage.createBug({
      title: "Database connection timeout in production",
      description: "Intermittent timeouts when querying the users table during peak hours.",
      priority: "High",
      status: "In Progress",
      assigneeId: dev2.id,
    });
    
    await storage.createBug({
      title: "Typo in welcome email",
      description: "The welcome email says 'Welocme' instead of 'Welcome'.",
      priority: "Low",
      status: "Resolved",
      assigneeId: dev3.id,
    });
    
    await storage.createBug({
      title: "Dark mode toggle not persisting",
      description: "User preference for dark mode is lost upon page refresh.",
      priority: "Medium",
      status: "Open",
      assigneeId: dev1.id,
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Seed the database
  seedDatabase().catch(console.error);

  // Developers
  app.get(api.developers.list.path, async (req, res) => {
    const devs = await storage.getDevelopers();
    res.json(devs);
  });

  app.post(api.developers.create.path, async (req, res) => {
    try {
      const input = api.developers.create.input.parse(req.body);
      const dev = await storage.createDeveloper(input);
      res.status(201).json(dev);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Bugs
  app.get(api.bugs.list.path, async (req, res) => {
    const allBugs = await storage.getBugs();
    res.json(allBugs);
  });

  app.get(api.bugs.get.path, async (req, res) => {
    const bug = await storage.getBug(Number(req.params.id));
    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }
    res.json(bug);
  });

  app.post(api.bugs.create.path, async (req, res) => {
    try {
      // Coerce assigneeId to number if it comes as a string
      const bodySchema = api.bugs.create.input.extend({
        assigneeId: z.coerce.number().optional().nullable(),
      });
      const input = bodySchema.parse(req.body);
      const bug = await storage.createBug(input);
      res.status(201).json(bug);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.bugs.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      const bodySchema = api.bugs.update.input.extend({
        assigneeId: z.coerce.number().optional().nullable(),
      });
      const updates = bodySchema.parse(req.body);
      
      const updated = await storage.updateBug(id, updates);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.bugs.delete.path, async (req, res) => {
    await storage.deleteBug(Number(req.params.id));
    res.status(204).send();
  });

  return httpServer;
}
