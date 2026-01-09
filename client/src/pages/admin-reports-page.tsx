import { useAdminReports, useAdminStudents } from "@/hooks/use-admin";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Download, Eye, Check, X, FileJson } from "lucide-react";
import { useState } from "react";
import { FIXED_TASKS } from "@shared/schema";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminReportsPage() {
  const [studentId, setStudentId] = useState<string>("all");
  const [date, setDate] = useState<string>(""); 

  const { data: reports, isLoading } = useAdminReports({
    studentId: studentId !== "all" ? Number(studentId) : undefined,
    startDate: date || undefined,
    endDate: date || undefined,
  });

  const { data: students } = useAdminStudents();

  const handleExportCSV = () => {
    if (!reports) return;
    
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

  const handleExportPDF = () => {
    if (!reports) return;

    const doc = new jsPDF();
    doc.text("Islamic Daily Tasks - Student Reports", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), "yyyy-MM-dd HH:mm")}`, 14, 22);

    const tableColumn = ["Date", "Student", "Score", "Completed Tasks"];
    const tableRows = reports.map(r => [
      format(new Date(r.date), "MMM dd, yyyy"),
      r.studentName,
      `${r.totalMarks}/10`,
      FIXED_TASKS.filter(t => (r.tasks as any)[t]).join(", ")
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] as [number, number, number] }
    });

    doc.save(`reports_export_${format(new Date(), "yyyy-MM-dd")}.pdf`);
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!reports?.length}>
            <FileJson className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={!reports?.length}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
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
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-2">
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex justify-between items-center pr-6">
                                <span>{report.studentName}'s Report</span>
                                <span className="text-sm font-normal text-muted-foreground">
                                  {format(new Date(report.date), "MMMM dd, yyyy")}
                                </span>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                                <span className="font-semibold">Total Score</span>
                                <span className="text-xl font-bold text-primary">{report.totalMarks}/10</span>
                              </div>
                              <div className="grid gap-2">
                                {FIXED_TASKS.map((task) => {
                                  const isCompleted = (report.tasks as any)[task];
                                  return (
                                    <div 
                                      key={task} 
                                      className={cn(
                                        "flex items-center justify-between p-2 rounded-md border text-sm transition-colors",
                                        isCompleted ? "bg-green-50/50 border-green-100" : "bg-red-50/50 border-red-100"
                                      )}
                                    >
                                      <span className={isCompleted ? "text-green-900" : "text-red-900"}>{task}</span>
                                      {isCompleted ? (
                                        <div className="bg-green-500 text-white rounded-full p-0.5">
                                          <Check className="w-3 h-3" />
                                        </div>
                                      ) : (
                                        <div className="bg-red-500 text-white rounded-full p-0.5">
                                          <X className="w-3 h-3" />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <p className="text-[10px] text-muted-foreground text-center">
                                Submitted at: {format(new Date(report.submittedAt), "MMM dd, yyyy hh:mm a")}
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
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

// Add missing cn helper if needed (assuming it exists in @/lib/utils)
import { cn } from "@/lib/utils";
