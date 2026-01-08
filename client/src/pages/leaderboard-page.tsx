import { useLeaderboard } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Medal, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
  const { data: leaderboard, isLoading } = useLeaderboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-display font-bold text-primary">Leaderboard</h1>
        <p className="text-muted-foreground">Celebrating consistency and dedication.</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {leaderboard && leaderboard.length > 0 ? (
          leaderboard.map((entry, index) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`
                border-2 overflow-hidden transition-all duration-300
                ${index === 0 ? 'border-yellow-400 shadow-lg shadow-yellow-400/10' : 
                  index === 1 ? 'border-gray-300' : 
                  index === 2 ? 'border-orange-300' : 'border-border'}
              `}>
                <CardContent className="p-4 flex items-center gap-6">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shrink-0
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                      index === 1 ? 'bg-gray-100 text-gray-700' : 
                      index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-secondary text-secondary-foreground'}
                  `}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {entry.name}
                      {index === 0 && <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                    </h3>
                    <p className="text-sm text-muted-foreground">Rank #{index + 1}</p>
                  </div>
                  
                  <div className="text-right">
                    <span className="block text-2xl font-bold font-display text-primary">
                      {entry.totalMarks}
                    </span>
                    <span className="text-xs text-muted-foreground">Total Points</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No rankings available yet.
          </div>
        )}
      </div>
    </div>
  );
}
