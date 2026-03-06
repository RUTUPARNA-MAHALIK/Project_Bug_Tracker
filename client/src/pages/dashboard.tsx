import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useBugs } from "@/hooks/use-bugs";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { BugIcon, CheckCircle2, AlertCircle, Clock } from "lucide-react";

const COLORS = {
  primary: "hsl(234, 89%, 67%)",     // Indigo
  success: "hsl(142, 71%, 45%)",     // Emerald
  warning: "hsl(45, 93%, 50%)",      // Amber
  danger: "hsl(0, 84%, 60%)",        // Rose
  muted: "hsl(240, 5%, 65%)"         // Zinc
};

export default function Dashboard() {
  const { data: bugs, isLoading } = useBugs();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  const bugsList = bugs || [];
  
  // Analytics computation
  const totalBugs = bugsList.length;
  const resolvedBugs = bugsList.filter(b => b.status === "Resolved").length;
  const openBugs = bugsList.filter(b => b.status === "Open").length;
  const inProgressBugs = bugsList.filter(b => b.status === "In Progress").length;
  const highPriorityBugs = bugsList.filter(b => b.priority === "High").length;

  // Chart Data: Status
  const statusData = [
    { name: 'Open', value: openBugs, color: COLORS.danger },
    { name: 'In Progress', value: inProgressBugs, color: COLORS.warning },
    { name: 'Resolved', value: resolvedBugs, color: COLORS.success },
  ];

  // Chart Data: Priority
  const priorityData = [
    { name: 'High', value: highPriorityBugs, color: COLORS.danger },
    { name: 'Medium', value: bugsList.filter(b => b.priority === "Medium").length, color: COLORS.warning },
    { name: 'Low', value: bugsList.filter(b => b.priority === "Low").length, color: COLORS.muted },
  ];

  // Chart Data: Assignee
  const assigneeMap = bugsList.reduce((acc, bug) => {
    const name = bug.assignee?.name || "Unassigned";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const assigneeData = Object.entries(assigneeMap)
    .map(([name, count]) => ({ name, bugs: count }))
    .sort((a, b) => b.bugs - a.bugs)
    .slice(0, 5); // Top 5

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-lg">Platform metrics and issue tracking overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Issues" 
          value={totalBugs} 
          icon={<BugIcon className="w-5 h-5 text-primary" />} 
          trend="+12% from last week"
        />
        <StatCard 
          title="Open Issues" 
          value={openBugs} 
          icon={<AlertCircle className="w-5 h-5 text-rose-500" />} 
          trend="Needs attention"
        />
        <StatCard 
          title="In Progress" 
          value={inProgressBugs} 
          icon={<Clock className="w-5 h-5 text-amber-500" />} 
          trend="Actively worked on"
        />
        <StatCard 
          title="Resolved" 
          value={resolvedBugs} 
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} 
          trend="Good job team"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="border-border/50 bg-card/40 backdrop-blur shadow-xl shadow-black/20">
          <CardHeader>
            <CardTitle>Issues by Status</CardTitle>
            <CardDescription>Current snapshot of all reported bugs</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {totalBugs > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="border-border/50 bg-card/40 backdrop-blur shadow-xl shadow-black/20">
          <CardHeader>
            <CardTitle>Issues by Priority</CardTitle>
            <CardDescription>Breakdown by severity level</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {totalBugs > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <p className="text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Assignees */}
        <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/40 backdrop-blur shadow-xl shadow-black/20">
          <CardHeader>
            <CardTitle>Top Assignees</CardTitle>
            <CardDescription>Developers with the most assigned issues</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {assigneeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assigneeData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="bugs" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: number, icon: React.ReactNode, trend: string }) {
  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 bg-background rounded-lg border border-border/50 shadow-inner">
            {icon}
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-4xl font-display font-bold tracking-tight text-foreground">{value}</h3>
          <p className="text-xs text-muted-foreground mt-2 font-medium">{trend}</p>
        </div>
      </CardContent>
    </Card>
  );
}
