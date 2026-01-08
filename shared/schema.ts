import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const FIXED_TASKS = [
  "Fajr Namaz",
  "Zuhr Namaz",
  "Asr Namaz",
  "Maghrib Namaz",
  "Isha Namaz",
  "Shaam ke Azkar",
  "Subha ke Azkar",
  "Quran ki Tilawat",
  "Guzishta din Sote Waqt ke Azkar",
  "Guzishta din Surah Mulk",
  "Dua"
] as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // email
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["student", "admin"] }).default("student").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: date("date").notNull(), // YYYY-MM-DD
  tasks: jsonb("tasks").$type<Record<string, boolean>>().notNull(),
  totalMarks: integer("total_marks").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// Relations aren't strictly needed for simple queries but good for documentation
// users -> many reports

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, userId: true, submittedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

// API Types moved to shared/routes.ts to avoid circular dependency
export type LoginRequest = { username: string; password: string };
export type RegisterRequest = InsertUser;
export type ReportSubmission = {
  date: string;
  tasks: Record<string, boolean>;
  totalMarks: number;
};

export type UserStats = {
  totalMarks: number;
  daysSubmitted: number;
  rank?: number;
};

export type AdminStats = {
  totalStudents: number;
  totalReports: number;
  avgDailyMarks: number;
};
