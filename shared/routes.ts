import { z } from "zod";
import { insertUserSchema, insertReportSchema, users, reports, FIXED_TASKS } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  conflict: z.object({
    message: z.string(),
  }),
};

// Type helpers - need to move these up or use z.infer locally
export const api = {
  auth: {
    login: {
      method: "POST" as const,
      path: "/api/login",
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    register: {
      method: "POST" as const,
      path: "/api/register",
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        409: errorSchemas.conflict,
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/logout",
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/user",
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  reports: {
    submit: {
      method: "POST" as const,
      path: "/api/reports",
      input: insertReportSchema,
      responses: {
        201: z.custom<typeof reports.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    listMy: {
      method: "GET" as const,
      path: "/api/reports/my",
      responses: {
        200: z.array(z.custom<typeof reports.$inferSelect>()),
      },
    },
  },
  admin: {
    students: {
      method: "GET" as const,
      path: "/api/admin/students",
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect & { stats: { totalMarks: number } }>()),
        403: errorSchemas.unauthorized,
      },
    },
    reports: {
      method: "GET" as const,
      path: "/api/admin/reports",
      input: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        studentId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof reports.$inferSelect & { studentName: string }>()),
        403: errorSchemas.unauthorized,
      },
    },
    leaderboard: {
      method: "GET" as const,
      path: "/api/admin/leaderboard",
      responses: {
        200: z.array(z.object({
          userId: z.number(),
          name: z.string(),
          totalMarks: z.number(),
          rank: z.number(),
        })),
        403: errorSchemas.unauthorized,
      },
    },
    stats: {
      method: "GET" as const,
      path: "/api/admin/stats",
      responses: {
        200: z.object({
          totalStudents: z.number(),
          totalReports: z.number(),
          avgMarks: z.number(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}
