import { useAuth } from "@/hooks/use-auth";
import { useMyReports, useSubmitReport } from "@/hooks/use-reports";
import { FIXED_TASKS } from "@shared/schema";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Trophy, Flame, Loader2, CalendarCheck, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: reports, isLoading } = useMyReports();
  const { mutate: submitReport, isPending } = useSubmitReport();
  
  const today = format(new Date(), "yyyy-MM-dd");
  const todayFormatted = format(new Date(), "EEEE, MMMM do, yyyy");

  const todayReport = reports?.find(r => r.date === today);
  const isSubmitted = !!todayReport;

  // Form State
  const [tasks, setTasks] = useState<Record<string, boolean>>(
    FIXED_TASKS.reduce((acc, task) => ({ ...acc, [task]: false }), {})
  );

  const currentScore = Object.values(tasks).filter(Boolean).length;
  const maxScore = FIXED_TASKS.length;

  const handleSubmit = () => {
    submitReport({
      date: today,
      tasks,
      totalMarks: currentScore,
    });
  };

  // Stats calculation
  const stats = useMemo(() => {
    if (!reports) return { streak: 0, totalMarks: 0, average: 0 };
    const totalMarks = reports.reduce((acc, curr) => acc + curr.totalMarks, 0);
    return {
      streak: reports.length, // Simplified streak logic for demo
      totalMarks,
      average: reports.length ? (totalMarks / reports.length).toFixed(1) : 0,
    };
  }, [reports]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            As-salamu alaykum, {user?.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" /> {todayFormatted}
          </p>
        </div>
        
        {isSubmitted && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium text-sm">Today's Report Submitted</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Score</p>
              <h3 className="text-2xl font-bold font-display">{stats.totalMarks}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
              <h3 className="text-2xl font-bold font-display">{stats.streak}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Daily Score</p>
              <h3 className="text-2xl font-bold font-display">{stats.average}/{maxScore}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Report Form */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-t-4 border-t-primary shadow-lg">
            <CardHeader>
              <CardTitle>Daily Checklist</CardTitle>
              <CardDescription>
                Mark your completed tasks for today. May Allah accept your efforts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold">JazakAllah Khair!</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    You scored <span className="font-bold text-foreground">{todayReport.totalMarks}/{maxScore}</span> today. 
                    Keep up the consistency!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-1 gap-3">
                    {FIXED_TASKS.map((task, index) => (
                      <motion.div 
                        key={task}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                          flex items-center justify-between p-4 rounded-xl border transition-all duration-200
                          ${tasks[task] 
                            ? "bg-primary/5 border-primary/30 shadow-sm" 
                            : "bg-background border-border hover:border-primary/20"
                          }
                        `}
                      >
                        <div className="flex flex-col">
                          <span className={`font-medium ${tasks[task] ? "text-primary" : "text-foreground"}`}>
                            {task}
                          </span>
                        </div>
                        <Switch
                          checked={tasks[task]}
                          onCheckedChange={(checked) => setTasks(prev => ({ ...prev, [task]: checked }))}
                        />
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t mt-4">
                    <div className="text-sm text-muted-foreground">
                      Current Score: <span className="font-bold text-foreground text-lg">{currentScore}</span>/{maxScore}
                    </div>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isPending || currentScore === 0}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Submit Report"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Panel - Recent Activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reports && reports.length > 0 ? (
                reports.slice(0, 5).map(report => (
                  <div key={report.id} className="flex items-center justify-between text-sm p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <span className="text-muted-foreground">{format(new Date(report.date), "MMM dd")}</span>
                    <span className="font-bold bg-secondary px-2 py-0.5 rounded text-xs">{report.totalMarks}/{maxScore}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No history yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
