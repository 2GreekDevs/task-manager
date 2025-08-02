import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Clock, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { TaskSidebar } from '@/components/TaskSidebar';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { TaskStats } from '@/components/TaskStats';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  projectId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  timeSpent: number; // in minutes
  subtasks: SubTask[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: Date;
}

const defaultProjects: Project[] = [
  { id: '1', name: 'Personal', color: '#8B5CF6', description: 'Personal tasks and goals', createdAt: new Date() },
  { id: '2', name: 'Work', color: '#10B981', description: 'Work-related tasks', createdAt: new Date() },
  { id: '3', name: 'Learning', color: '#F59E0B', description: 'Learning and development', createdAt: new Date() },
];

export const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskManager-tasks');
    const savedProjects = localStorage.getItem('taskManager-projects');
    
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error parsing saved tasks:', error);
        localStorage.removeItem('taskManager-tasks');
      }
    }
    
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects).map((project: any) => ({
          ...project,
          createdAt: new Date(project.createdAt),
        }));
        setProjects(parsedProjects);
      } catch (error) {
        console.error('Error parsing saved projects:', error);
        localStorage.removeItem('taskManager-projects');
      }
    }
  }, []);

  // Save to localStorage whenever tasks or projects change
  useEffect(() => {
    localStorage.setItem('taskManager-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskManager-projects', JSON.stringify(projects));
  }, [projects]);

  const addTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title || '',
      description: taskData.description || '',
      completed: false,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate,
      projectId: taskData.projectId || '1',
      tags: taskData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      timeSpent: 0,
      subtasks: [],
    };
    
    setTasks(prev => [...prev, newTask]);
    setIsTaskFormOpen(false);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const addProject = (projectData: Partial<Project>) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: projectData.name || '',
      color: projectData.color || '#8B5CF6',
      description: projectData.description || '',
      createdAt: new Date(),
    };
    
    setProjects(prev => [...prev, newProject]);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesProject = selectedProject === 'all' || task.projectId === selectedProject;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && task.completed) ||
                         (filterStatus === 'pending' && !task.completed);
    
    return matchesProject && matchesSearch && matchesPriority && matchesStatus;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'createdAt':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <TaskSidebar
          projects={projects}
          selectedProject={selectedProject}
          onProjectSelect={setSelectedProject}
          onAddProject={addProject}
          tasks={tasks}
        />
        
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Task Manager
                </h1>
                <p className="text-muted-foreground mt-1">
                  {selectedProject === 'all' 
                    ? 'All tasks across projects' 
                    : projects.find(p => p.id === selectedProject)?.name
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <ThemeToggle />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
                >
                  {viewMode === 'list' ? 'Board View' : 'List View'}
                </Button>
                
                <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
                  <DialogTrigger asChild>
                    <Button variant="gradient" className="shadow-elegant">
                      <Plus className="w-4 h-4" />
                      New Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <TaskForm
                      projects={projects}
                      onSubmit={addTask}
                      onCancel={() => setIsTaskFormOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Stats */}
            <TaskStats tasks={tasks} selectedProject={selectedProject} />
          </div>

          {/* Filters and Search */}
          <Card className="p-4 mb-6 shadow-card">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Task List */}
          <TaskList
            tasks={sortedTasks}
            projects={projects}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskFormOpen(true);
            }}
            viewMode={viewMode}
          />
        </main>
      </div>
      
      {/* Edit Task Dialog */}
      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="max-w-2xl">
            <TaskForm
              projects={projects}
              initialTask={editingTask}
              onSubmit={(updates) => {
                updateTask(editingTask.id, updates);
                setEditingTask(null);
              }}
              onCancel={() => setEditingTask(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};