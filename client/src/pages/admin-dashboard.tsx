import { useAdminStats, useAdminStudents, useLeaderboard } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Users, FileText, TrendingUp, Medal, Activity, CheckCircle, Trash2 } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: students, isLoading: studentsLoading } = useAdminStudents();
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard();
  const { toast } = useToast();

  const handleDeleteUser = async (userId: number) => {
    try {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leaderboard"] });
      toast({
        title: "User deleted",
        description: "Student account and reports have been removed.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (statsLoading || studentsLoading || leaderboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">Detailed analytics and student performance trends.</p>
        </div>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate transition-all border-none shadow-sm bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600/80 uppercase tracking-wider">Students</p>
              <h3 className="text-3xl font-bold font-display">{stats?.totalStudents}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate transition-all border-none shadow-sm bg-green-50/50 dark:bg-green-900/10">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 text-green-600 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600/80 uppercase tracking-wider">Reports</p>
              <h3 className="text-3xl font-bold font-display">{stats?.totalReports}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-none shadow-sm bg-purple-50/50 dark:bg-purple-900/10">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600/80 uppercase tracking-wider">Avg Marks</p>
              <h3 className="text-3xl font-bold font-display">{stats?.avgMarks.toFixed(1)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-none shadow-sm bg-orange-50/50 dark:bg-orange-900/10">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 text-orange-600 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-orange-600/80 uppercase tracking-wider">Activity Rate</p>
              <h3 className="text-3xl font-bold font-display">
                {stats?.totalStudents ? ((stats.totalReports / (stats.totalStudents * 7)) * 100).toFixed(0) : 0}%
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Daily Submissions Trend */}
        <Card className="lg:col-span-2 overflow-hidden border-none shadow-md">
          <CardHeader className="bg-muted/30 pb-8">
            <CardTitle className="text-xl">Submission Trends</CardTitle>
            <CardDescription>Daily report volume for the last 14 days</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.dailyStats}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Completion Heatmap (Simplified as Bar Chart) */}
        <Card className="border-none shadow-md">
          <CardHeader className="bg-muted/30 pb-8">
            <CardTitle className="text-xl">Popular Tasks</CardTitle>
            <CardDescription>Frequency of completed actions</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.taskStats?.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="task" 
                    type="category" 
                    fontSize={10} 
                    width={100} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Performers */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <Medal className="w-5 h-5 text-yellow-500" />
              Leaderboard
            </CardTitle>
            <CardDescription>Top students based on cumulative score</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {leaderboard?.slice(0, 6).map((entry, index) => (
                <div key={entry.userId} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm
                      ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                        index === 1 ? 'bg-slate-100 text-slate-700' : 
                        index === 2 ? 'bg-amber-100 text-amber-700' : 'bg-white dark:bg-slate-800 text-muted-foreground border'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{entry.name}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Student ID: {entry.userId}</p>
                    </div>
                  </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <p className="text-lg font-bold text-primary font-display">{entry.totalMarks}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Points</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {entry.name}? This will permanently remove their account and all submission data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(entry.userId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                </div>
              ))}
              {(!leaderboard || leaderboard.length === 0) && (
                <p className="text-center text-muted-foreground py-12">No data available yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Student Comparison Chart */}
        <Card className="border-none shadow-md">
          <CardHeader className="bg-muted/30">
            <CardTitle>Performance Distribution</CardTitle>
            <CardDescription>Comparing top 5 students</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaderboard?.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                  />
                  <Bar dataKey="totalMarks" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
