import React, { useState } from 'react';
import { Plus, Home, Briefcase, BookOpen, Settings, MoreHorizontal, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Project, Task } from './TaskManager';

interface TaskSidebarProps {
  projects: Project[];
  selectedProject: string;
  onProjectSelect: (projectId: string) => void;
  onAddProject: (project: Partial<Project>) => void;
  tasks: Task[];
}

const projectIcons = {
  'Personal': Home,
  'Work': Briefcase,
  'Learning': BookOpen,
};

export const TaskSidebar: React.FC<TaskSidebarProps> = ({
  projects,
  selectedProject,
  onProjectSelect,
  onAddProject,
  tasks,
}) => {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    color: '#8B5CF6',
  });

  const getTaskCount = (projectId: string) => {
    if (projectId === 'all') {
      return tasks.length;
    }
    return tasks.filter(task => task.projectId === projectId).length;
  };

  const getCompletedCount = (projectId: string) => {
    if (projectId === 'all') {
      return tasks.filter(task => task.completed).length;
    }
    return tasks.filter(task => task.projectId === projectId && task.completed).length;
  };

  const handleAddProject = () => {
    if (newProject.name.trim()) {
      onAddProject(newProject);
      setNewProject({ name: '', description: '', color: '#8B5CF6' });
      setIsAddingProject(false);
    }
  };

  const colors = [
    '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316'
  ];

  return (
    <div className="w-80 bg-card border-r border-border p-6 min-h-screen">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-1">Projects</h2>
        <p className="text-sm text-muted-foreground">Organize your tasks</p>
      </div>

      <div className="space-y-2 mb-6">
        <button
          onClick={() => onProjectSelect('all')}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-accent ${
            selectedProject === 'all' 
              ? 'bg-accent text-accent-foreground border border-border' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gradient-primary"></div>
            <span className="font-medium">All Tasks</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {getTaskCount('all')}
          </Badge>
        </button>

        {projects.map((project) => {
          const IconComponent = projectIcons[project.name as keyof typeof projectIcons] || Folder;
          const taskCount = getTaskCount(project.id);
          const completedCount = getCompletedCount(project.id);
          
          return (
            <button
              key={project.id}
              onClick={() => onProjectSelect(project.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-accent ${
                selectedProject === project.id 
                  ? 'bg-accent text-accent-foreground border border-border' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                ></div>
                <span className="font-medium">{project.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {completedCount}/{taskCount}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2">
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="Enter project name"
                value={newProject.name}
                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="project-description">Description (Optional)</Label>
              <Textarea
                id="project-description"
                placeholder="Enter project description"
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div>
              <Label>Project Color</Label>
              <div className="flex gap-2 mt-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewProject(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newProject.color === color 
                        ? 'border-foreground scale-110' 
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button onClick={handleAddProject} className="flex-1">
                Create Project
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAddingProject(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Stats */}
      <Card className="mt-8 p-4 bg-gradient-accent border-0">
        <h3 className="font-medium mb-3 text-sm text-foreground">Quick Stats</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Tasks</span>
            <span className="font-medium">{tasks.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completed</span>
            <span className="font-medium text-success">{tasks.filter(t => t.completed).length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pending</span>
            <span className="font-medium text-warning">{tasks.filter(t => !t.completed).length}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};