import { useMyReports } from "@/hooks/use-reports";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar } from "lucide-react";
import { FIXED_TASKS } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export default function HistoryPage() {
  const { data: reports, isLoading } = useMyReports();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">History</h1>
        <p className="text-muted-foreground">View your past submissions and consistency.</p>
      </div>

      <div className="grid gap-6">
        {reports && reports.length > 0 ? (
          reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {format(new Date(report.date), "EEEE, MMMM do, yyyy")}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      Score: <span className="font-semibold text-foreground">{report.totalMarks}/10</span>
                    </span>
                  </div>
                </div>
                <Badge variant={report.totalMarks >= 8 ? "default" : report.totalMarks >= 5 ? "secondary" : "destructive"}>
                  {report.totalMarks >= 8 ? "Excellent" : report.totalMarks >= 5 ? "Good" : "Needs Improvement"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mt-4">
                  {FIXED_TASKS.map((task) => {
                    // @ts-ignore
                    const isDone = report.tasks[task];
                    return (
                      <span 
                        key={task}
                        className={`
                          text-xs px-2.5 py-1 rounded-full border
                          ${isDone 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-gray-50 text-gray-400 border-gray-100 line-through decoration-gray-300"
                          }
                        `}
                      >
                        {task}
                      </span>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed">
            <h3 className="text-lg font-medium text-muted-foreground">No reports submitted yet</h3>
            <p className="text-sm text-muted-foreground/80 mt-1">Start by submitting your daily report on the dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}
