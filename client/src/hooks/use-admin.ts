import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useAdminStats() {
  return useQuery({
    queryKey: [api.admin.stats.path],
    queryFn: async () => {
      const res = await fetch(api.admin.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.admin.stats.responses[200].parse(await res.json());
    },
  });
}

export function useAdminStudents() {
  return useQuery({
    queryKey: [api.admin.students.path],
    queryFn: async () => {
      const res = await fetch(api.admin.students.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch students");
      return api.admin.students.responses[200].parse(await res.json());
    },
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: [api.admin.leaderboard.path],
    queryFn: async () => {
      const res = await fetch(api.admin.leaderboard.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return api.admin.leaderboard.responses[200].parse(await res.json());
    },
  });
}

export function useAdminReports(filters?: { startDate?: string; endDate?: string; studentId?: number }) {
  return useQuery({
    queryKey: [api.admin.reports.path, filters],
    queryFn: async () => {
      const url = buildUrl(api.admin.reports.path);
      const searchParams = new URLSearchParams();
      if (filters?.startDate) searchParams.append("startDate", filters.startDate);
      if (filters?.endDate) searchParams.append("endDate", filters.endDate);
      if (filters?.studentId) searchParams.append("studentId", String(filters.studentId));

      const res = await fetch(`${url}?${searchParams.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reports");
      return api.admin.reports.responses[200].parse(await res.json());
    },
  });
}
