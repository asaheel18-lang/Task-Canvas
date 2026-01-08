import { useAdminReports, useAdminStudents } from "@/hooks/use-admin";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Download, Filter } from "lucide-react";
import { useState } from "react";
import { FIXED_TASKS } from "@shared/schema";

export default function AdminReportsPage() {
  const [studentId, setStudentId] = useState<string>("all");
  const [date, setDate] = useState<string>(""); // Simple date string for now

  const { data: reports, isLoading } = useAdminReports({
    studentId: studentId !== "all" ? Number(studentId) : undefined,
    startDate: date || undefined,
    endDate: date || undefined,
  });

  const { data: students } = useAdminStudents();

  const handleExport = () => {
    if (!reports) return;
    
    // Create CSV content
    const headers = ["Date", "Student", "Score", ...FIXED_TASKS].join(",");
    const rows = reports.map(r => {
      // @ts-ignore
      const tasks = FIXED_TASKS.map(t => r.tasks[t] ? "Yes" : "No").join(",");
      return `${r.date},${r.studentName},${r.totalMarks},${tasks}`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reports_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Reports Log</h1>
          <p className="text-muted-foreground">Detailed view of all daily submissions.</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={!reports?.length}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-secondary/20 border-secondary/50">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-end sm:items-center">
          <div className="w-full sm:w-[200px]">
            <label className="text-xs font-medium mb-1 block">Filter by Student</label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All Students" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {students?.map(s => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-[200px]">
            <label className="text-xs font-medium mb-1 block">Filter by Date</label>
            <Input 
              type="date" 
              className="bg-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {(studentId !== "all" || date) && (
            <Button 
              variant="ghost" 
              onClick={() => { setStudentId("all"); setDate(""); }}
              className="text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border-t">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{format(new Date(report.date), "MMM dd, yyyy")}</TableCell>
                      <TableCell className="font-medium">{report.studentName}</TableCell>
                      <TableCell className="text-center">
                        <span className={`
                          inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold
                          ${report.totalMarks >= 8 ? 'bg-green-100 text-green-700' : 
                            report.totalMarks >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                        `}>
                          {report.totalMarks}/10
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs">
                        {/* Only show first 3 completed tasks for brevity */}
                        {FIXED_TASKS.filter(t => (report.tasks as any)[t]).slice(0, 2).join(", ")}
                        {Object.values(report.tasks as any).filter(Boolean).length > 2 && "..."}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No reports found for selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
