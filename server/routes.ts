import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword } from "./auth"; // Import hashPassword
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { FIXED_TASKS } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup
  setupAuth(app);

  // === STUDENT ROUTES ===

  // Submit Report
  app.post(api.reports.submit.path, async (req, res) => {
    if (!req.user) return res.status(401).send();
    
    try {
      const input = api.reports.submit.input.parse(req.body);
      
      // Check if already submitted for this date
      const existing = await storage.getReportByDate(req.user.id, input.date);
      if (existing) {
        return res.status(409).json({ message: "Report already submitted for this date" });
      }

      // Calculate score securely backend-side
      let calculatedScore = 0;
      Object.entries(input.tasks).forEach(([task, completed]) => {
        if (FIXED_TASKS.includes(task as any) && completed) {
          calculatedScore += 1;
        }
      });
      
      // Override client score with trusted calculation
      const report = await storage.createReport({
        ...input,
        userId: req.user.id,
        totalMarks: calculatedScore
      });

      res.status(201).json(report);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Get My Reports
  app.get(api.reports.listMy.path, async (req, res) => {
    if (!req.user) return res.status(401).send();
    const reports = await storage.getReportsByUser(req.user.id);
    res.json(reports);
  });

  // === ADMIN ROUTES ===

  // Middleware to ensure admin
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  app.get(api.admin.students.path, requireAdmin, async (req, res) => {
    const students = await storage.getAllUsers();
    // Filter to show only students
    res.json(students.filter(u => u.role === 'student'));
  });

  app.get(api.admin.reports.path, requireAdmin, async (req, res) => {
    const filters = req.query as { startDate?: string; endDate?: string; studentId?: string };
    const reports = await storage.getAllReports({
      startDate: filters.startDate,
      endDate: filters.endDate,
      studentId: filters.studentId ? Number(filters.studentId) : undefined
    });
    res.json(reports);
  });

  app.get(api.admin.leaderboard.path, requireAdmin, async (req, res) => {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  app.get(api.admin.stats.path, requireAdmin, async (req, res) => {
    const stats = await storage.getGlobalStats();
    res.json(stats);
  });

  // Seed Admin User
  await seedAdmin();

  return httpServer;
}

async function seedAdmin() {
  const adminEmail = "asaheel18@gmail.com";
  const existing = await storage.getUserByUsername(adminEmail);
  if (!existing) {
    const hashedPassword = await hashPassword("saheel2006");
    await storage.createUser({
      username: adminEmail,
      password: hashedPassword,
      name: "Admin User",
      role: "admin"
    });
    console.log("Admin account created");
  }
}
