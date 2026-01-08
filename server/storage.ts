import { db } from "./db";
import { users, reports, type User, type InsertUser, type Report, type InsertReport } from "@shared/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User ops
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Report ops
  createReport(report: InsertReport): Promise<Report>;
  getReportsByUser(userId: number): Promise<Report[]>;
  getReportByDate(userId: number, date: string): Promise<Report | undefined>;
  getAllReports(filters?: { startDate?: string; endDate?: string; studentId?: number }): Promise<(Report & { studentName: string })[]>;

  // Stats
  getLeaderboard(): Promise<{ userId: number; name: string; totalMarks: number; rank: number }[]>;
  getGlobalStats(): Promise<{ totalStudents: number; totalReports: number; avgMarks: number }>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report as any).returning();
    return newReport;
  }

  async getReportsByUser(userId: number): Promise<Report[]> {
    return await db.select()
      .from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.date));
  }

  async getReportByDate(userId: number, date: string): Promise<Report | undefined> {
    const [report] = await db.select()
      .from(reports)
      .where(and(eq(reports.userId, userId), eq(reports.date, date)));
    return report;
  }

  async getAllReports(filters?: { startDate?: string; endDate?: string; studentId?: number }): Promise<(Report & { studentName: string })[]> {
    const conditions = [];
    if (filters?.startDate) conditions.push(gte(reports.date, filters.startDate));
    if (filters?.endDate) conditions.push(lte(reports.date, filters.endDate));
    if (filters?.studentId) conditions.push(eq(reports.userId, filters.studentId));

    const result = await db.select({
      id: reports.id,
      userId: reports.userId,
      date: reports.date,
      tasks: reports.tasks,
      totalMarks: reports.totalMarks,
      submittedAt: reports.submittedAt,
      studentName: users.name
    })
    .from(reports)
    .innerJoin(users, eq(reports.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(reports.date));

    return result;
  }

  async getLeaderboard(): Promise<{ userId: number; name: string; totalMarks: number; rank: number }[]> {
    const result = await db.select({
      userId: users.id,
      name: users.name,
      totalMarks: sql<number>`sum(${reports.totalMarks})::int`
    })
    .from(users)
    .leftJoin(reports, eq(users.id, reports.userId))
    .where(eq(users.role, 'student'))
    .groupBy(users.id, users.name)
    .orderBy(desc(sql`sum(${reports.totalMarks})`));

    // Assign ranks
    return result.map((item, index) => ({
      ...item,
      totalMarks: item.totalMarks || 0,
      rank: index + 1
    }));
  }

  async getGlobalStats(): Promise<{ totalStudents: number; totalReports: number; avgMarks: number }> {
    const [studentCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'student'));
    const [reportCount] = await db.select({ count: sql<number>`count(*)` }).from(reports);
    const [avg] = await db.select({ avg: sql<number>`avg(${reports.totalMarks})` }).from(reports);

    return {
      totalStudents: Number(studentCount?.count || 0),
      totalReports: Number(reportCount?.count || 0),
      avgMarks: Number(avg?.avg || 0)
    };
  }
}

export const storage = new DatabaseStorage();
