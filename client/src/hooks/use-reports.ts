import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ReportSubmission } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useMyReports() {
  return useQuery({
    queryKey: [api.reports.listMy.path],
    queryFn: async () => {
      const res = await fetch(api.reports.listMy.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reports");
      return api.reports.listMy.responses[200].parse(await res.json());
    },
  });
}

export function useSubmitReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ReportSubmission) => {
      const validated = api.reports.submit.input.parse(data);
      const res = await fetch(api.reports.submit.path, {
        method: api.reports.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit report");
      }
      return api.reports.submit.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.listMy.path] });
      // Invalidate admin queries too if admin is viewing
      queryClient.invalidateQueries({ queryKey: [api.admin.reports.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
      toast({
        title: "Alhamdulillah!",
        description: "Your daily report has been submitted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
