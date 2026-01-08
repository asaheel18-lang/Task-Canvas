import { useAdminStats, useAdminStudents, useLeaderboard } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, FileText, TrendingUp, Medal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: students, isLoading: studentsLoading } = useAdminStudents();
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard();

  if (statsLoading || studentsLoading || leaderboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of student performance and activity.</p>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Students</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.totalStudents}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.totalReports}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-500 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Daily Marks</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.avgMarks.toFixed(1)}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Performers */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="w-5 h-5 text-yellow-500" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard?.slice(0, 5).map((entry, index) => (
                <div key={entry.userId} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-secondary/50">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                        index === 1 ? 'bg-gray-100 text-gray-700' : 
                        index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-muted-foreground border'}
                    `}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{entry.name}</span>
                  </div>
                  <div className="text-sm font-bold text-primary">
                    {entry.totalMarks} pts
                  </div>
                </div>
              ))}
              {(!leaderboard || leaderboard.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No data available yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Student Performance Chart (Mock using top students data) */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Top Student Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaderboard?.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="totalMarks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
