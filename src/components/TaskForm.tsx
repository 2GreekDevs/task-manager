import React, { useState } from 'react';
import { CalendarDays, Tag, Flag, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import type { Task, Project } from './TaskManager';

interface TaskFormProps {
  projects: Project[];
  initialTask?: Task;
  onSubmit: (task: Partial<Task>) => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  projects,
  initialTask,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    priority: initialTask?.priority || 'medium',
    projectId: initialTask?.projectId || projects[0]?.id || '',
    dueDate: initialTask?.dueDate || undefined,
    tags: initialTask?.tags || [],
  });

  const [newTag, setNewTag] = useState('');
  const [subtasks, setSubtasks] = useState(initialTask?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;
    
    onSubmit({
      ...formData,
      subtasks: subtasks.length > 0 ? subtasks : [],
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const newSubtaskObj = {
        id: Date.now().toString(),
        title: newSubtask.trim(),
        completed: false,
      };
      setSubtasks(prev => [...prev, newSubtaskObj]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (subtaskId: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== subtaskId));
  };

  const toggleSubtask = (subtaskId: string) => {
    setSubtasks(prev => prev.map(st => 
      st.id === subtaskId 
        ? { ...st, completed: !st.completed }
        : st
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DialogHeader>
        <DialogTitle>
          {initialTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <Label htmlFor="title">Task Title *</Label>
          <Input
            id="title"
            placeholder="Enter task title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter task description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>

        {/* Project and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="project">Project</Label>
            <Select value={formData.projectId} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, projectId: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value: Task['priority']) => 
              setFormData(prev => ({ ...prev, priority: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-muted-foreground" />
                    Low Priority
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-warning" />
                    Medium Priority
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-destructive" />
                    High Priority
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <Label>Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left font-normal"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {formData.dueDate ? format(formData.dueDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.dueDate}
                onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add a tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Subtasks */}
        <div>
          <Label>Subtasks</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add a subtask"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
            />
            <Button type="button" onClick={addSubtask} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {subtasks.length > 0 && (
            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2 p-2 border rounded">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => toggleSubtask(subtask.id)}
                    className="rounded"
                  />
                  <span className={`flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {subtask.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(subtask.id)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {initialTask ? 'Update Task' : 'Create Task'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};