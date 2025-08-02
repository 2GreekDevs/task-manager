import React from 'react';
import { CheckCircle2, Clock, Calendar, TrendingUp, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { isToday, isTomorrow, isPast, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import type { Task } from './TaskManager';

interface TaskStatsProps {
  tasks: Task[];
  selectedProject: string;
}

export const TaskStats: React.FC<TaskStatsProps> = ({ tasks, selectedProject }) => {
  const filteredTasks = selectedProject === 'all' 
    ? tasks 
    : tasks.filter(task => task.projectId === selectedProject);

  const completedTasks = filteredTasks.filter(task => task.completed);
  const pendingTasks = filteredTasks.filter(task => !task.completed);
  const overdueTasks = filteredTasks.filter(task => 
    task.dueDate && isPast(task.dueDate) && !task.completed
  );
  const todayTasks = filteredTasks.filter(task => 
    task.dueDate && isToday(task.dueDate)
  );
  const tomorrowTasks = filteredTasks.filter(task => 
    task.dueDate && isTomorrow(task.dueDate)
  );

  const thisWeekTasks = filteredTasks.filter(task => {
    if (!task.dueDate) return false;
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    return isWithinInterval(task.dueDate, { start: weekStart, end: weekEnd });
  });

  const highPriorityTasks = filteredTasks.filter(task => 
    task.priority === 'high' && !task.completed
  );

  const totalTimeSpent = filteredTasks.reduce((total, task) => total + task.timeSpent, 0);

  const completionRate = filteredTasks.length > 0 
    ? Math.round((completedTasks.length / filteredTasks.length) * 100) 
    : 0;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const stats = [
    {
      title: 'Total Tasks',
      value: filteredTasks.length,
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Completed',
      value: completedTasks.length,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Pending',
      value: pendingTasks.length,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Time Spent',
      value: formatTime(totalTimeSpent),
      icon: Clock,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Progress and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Progress */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Completion Rate
            </h3>
            <Badge variant="secondary" className="text-sm">
              {completionRate}%
            </Badge>
          </div>
          <Progress value={completionRate} className="mb-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Completed:</span>
              <span className="ml-2 font-medium text-success">{completedTasks.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Remaining:</span>
              <span className="ml-2 font-medium text-warning">{pendingTasks.length}</span>
            </div>
          </div>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="p-6 shadow-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Deadlines
          </h3>
          <div className="space-y-3">
            {overdueTasks.length > 0 && (
              <div className="flex items-center justify-between p-2 bg-destructive/10 rounded-lg">
                <span className="text-sm text-destructive">Overdue</span>
                <Badge variant="destructive" className="text-xs">
                  {overdueTasks.length}
                </Badge>
              </div>
            )}
            
            {todayTasks.length > 0 && (
              <div className="flex items-center justify-between p-2 bg-warning/10 rounded-lg">
                <span className="text-sm text-warning">Due Today</span>
                <Badge variant="secondary" className="text-xs">
                  {todayTasks.length}
                </Badge>
              </div>
            )}
            
            {tomorrowTasks.length > 0 && (
              <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg">
                <span className="text-sm text-primary">Due Tomorrow</span>
                <Badge variant="secondary" className="text-xs">
                  {tomorrowTasks.length}
                </Badge>
              </div>
            )}
            
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">This Week</span>
              <Badge variant="outline" className="text-xs">
                {thisWeekTasks.length}
              </Badge>
            </div>
            
            {highPriorityTasks.length > 0 && (
              <div className="flex items-center justify-between p-2 bg-destructive/10 rounded-lg">
                <span className="text-sm text-destructive">High Priority</span>
                <Badge variant="destructive" className="text-xs">
                  {highPriorityTasks.length}
                </Badge>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};