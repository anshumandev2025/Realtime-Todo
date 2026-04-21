"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProjectStore } from '@/store/useProjectStore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, isAuthenticated, activeOrganizationId } = useAuthStore();
  const { projects, isLoading, error, fetchProjects, createProject, clear } = useProjectStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Fetch whenever the active org changes
  useEffect(() => {
    if (activeOrganizationId) {
      fetchProjects(activeOrganizationId);
    } else {
      clear();
    }
  }, [activeOrganizationId, fetchProjects, clear]);

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Please log in to view the dashboard.</div>;
  }

  if (!activeOrganizationId) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-3.5rem)] text-center px-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">No Organization Selected</h2>
          <p className="text-muted-foreground">
            Select an organization from the top menu, or ask an owner to invite you.
          </p>
        </div>
      </div>
    );
  }

  const handleCreateProject = async () => {
    if (!projectName.trim()) return toast.error('Project name is required');
    setCreating(true);
    try {
      await createProject({ name: projectName, description: projectDesc, organizationId: activeOrganizationId });
      toast.success('Project created successfully');
      setIsDialogOpen(false);
      setProjectName('');
      setProjectDesc('');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const activeOrg = user?.organizations?.find((o) => o._id === activeOrganizationId);

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            {activeOrg ? `Manage projects in ${activeOrg.name}` : 'Your projects'}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Project</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new project board to start tracking tasks.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="proj-name" className="text-right">Name</Label>
                <Input
                  id="proj-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="proj-desc" className="text-right">Description</Label>
                <Input
                  id="proj-desc"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateProject} disabled={creating}>
                {creating ? 'Creating…' : 'Create Project'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
          <p className="text-muted-foreground mb-4">No projects in this organization yet.</p>
          <Button onClick={() => setIsDialogOpen(true)} variant="outline">
            Create your first project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {projects.map((project) => (
            <Link key={project._id} href={`/projects/${project._id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
                <CardHeader className="p-5">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">
                    {project.description || 'No description'}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
