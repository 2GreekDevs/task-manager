import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Tag, 
  MoreHorizontal, 
  Edit3, 
  Trash2,
  Play,
  Pause,
  Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import type { Task, Project } from './TaskManager';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  viewMode: 'list' | 'kanban';
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  projects,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  viewMode,
}) => {
  const [timers, setTimers] = useState<{ [taskId: string]: number }>({});
  const [activeTimer, setActiveTimer] = useState<string | null>(null);

  const getProject = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPriorityBadgeVariant = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDueDate = (dueDate: Date) => {
    if (isToday(dueDate)) return 'Today';
    if (isTomorrow(dueDate)) return 'Tomorrow';
    if (isPast(dueDate)) return `Overdue - ${format(dueDate, 'MMM d')}`;
    return format(dueDate, 'MMM d, yyyy');
  };

  const getDueDateColor = (dueDate: Date) => {
    if (isPast(dueDate)) return 'text-destructive';
    if (isToday(dueDate)) return 'text-warning';
    return 'text-muted-foreground';
  };

  const toggleTimer = (taskId: string) => {
    if (activeTimer === taskId) {
      // Stop timer
      setActiveTimer(null);
    } else {
      // Start timer
      setActiveTimer(taskId);
      if (!timers[taskId]) {
        setTimers(prev => ({ ...prev, [taskId]: 0 }));
      }
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        setTimers(prev => {
          const newTimers = {
            ...prev,
            [activeTimer]: (prev[activeTimer] || 0) + 1
          };
          
          // Update the actual task time spent
          const currentTask = tasks.find(t => t.id === activeTimer);
          if (currentTask) {
            onUpdateTask(activeTimer, { 
              timeSpent: currentTask.timeSpent + 1
            });
          }
          
          return newTimers;
        });
      }, 60000); // Update every minute
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer, onUpdateTask, tasks]);

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const project = getProject(task.projectId);
    const isOverdue = task.dueDate && isPast(task.dueDate) && !task.completed;
    
    return (
      <Card className={`p-4 transition-all duration-300 hover:shadow-card cursor-pointer group ${
        task.completed ? 'opacity-75' : ''
      } ${isOverdue ? 'border-destructive/30 bg-destructive/5' : ''}`}>
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={(checked) => 
              onUpdateTask(task.id, { completed: checked as boolean })
            }
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className={`font-medium mb-1 ${
                  task.completed ? 'line-through text-muted-foreground' : ''
                }`}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant={getPriorityBadgeVariant(task.priority)}
                    className="text-xs"
                  >
                    <Flag className="w-3 h-3 mr-1" />
                    {task.priority}
                  </Badge>
                  
                  {project && (
                    <Badge variant="outline" className="text-xs">
                      <div 
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </Badge>
                  )}
                  
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {task.subtasks.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground">
                      Subtasks: {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                    </div>
                    <div className="w-full bg-muted rounded-full h-1 mt-1">
                      <div 
                        className="bg-primary h-1 rounded-full transition-all"
                        style={{ 
                          width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditTask(task)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDeleteTask(task.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                {task.dueDate && (
                  <div className={`flex items-center gap-1 ${getDueDateColor(task.dueDate)}`}>
                    <Calendar className="w-3 h-3" />
                    {formatDueDate(task.dueDate)}
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(task.timeSpent + (timers[task.id] || 0))}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleTimer(task.id)}
                className="h-6 px-2 text-xs"
              >
                {activeTimer === task.id ? (
                  <>
                    <Pause className="w-3 h-3 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (viewMode === 'kanban') {
    const todoTasks = tasks.filter(task => !task.completed);
    const inProgressTasks = tasks.filter(task => !task.completed && activeTimer === task.id);
    const completedTasks = tasks.filter(task => task.completed);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Circle className="w-4 h-4 text-muted-foreground" />
            To Do ({todoTasks.length})
          </h3>
          <div className="space-y-3">
            {todoTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning" />
            In Progress ({inProgressTasks.length})
          </h3>
          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p>Create your first task to get started!</p>
          </div>
        </Card>
      ) : (
        tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))
      )}
    </div>
  );
};