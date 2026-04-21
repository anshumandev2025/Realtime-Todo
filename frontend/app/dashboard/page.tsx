"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProjectStore, Member } from '@/store/useProjectStore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Pencil, Trash2, UserPlus, X } from 'lucide-react';
import { api } from '@/lib/api';
import { AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle, } from '@/components/ui/alert-dialog';

interface AllUser {
  _id: string;
  name: string;
  username: string;
  email: string;
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { projects, isLoading, fetchProjects, createProject, updateProject, deleteProject, addMember, removeMember, clear } =
    useProjectStore();

  // Create project state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit project state
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editing, setEditing] = useState(false);

  // Delete project state
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Members dialog state
  const [membersProjectId, setMembersProjectId] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<AllUser[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchProjects();
    } else {
      clear();
    }
  }, [user?._id, fetchProjects, clear]);

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Please log in to view the dashboard.</div>;
  }

  // ── Create Project ──
  const handleCreateProject = async () => {
    if (!projectName.trim()) return toast.error('Project name is required');
    setCreating(true);
    try {
      await createProject({ name: projectName, description: projectDesc });
      toast.success('Project created successfully');
      setIsCreateOpen(false);
      setProjectName('');
      setProjectDesc('');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  // ── Edit Project ──
  const openEditDialog = (e: React.MouseEvent, id: string, name: string, desc?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setEditProjectId(id);
    setEditName(name);
    setEditDesc(desc ?? '');
  };

  const handleUpdateProject = async () => {
    if (!editName.trim()) return toast.error('Project name is required');
    if (!editProjectId) return;
    setEditing(true);
    try {
      await updateProject(editProjectId, { name: editName.trim(), description: editDesc.trim() });
      toast.success('Project updated');
      setEditProjectId(null);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update project');
    } finally {
      setEditing(false);
    }
  };

  // ── Delete Project ──
  const openDeleteDialog = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteProjectId(id);
  };

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return;
    setDeleting(true);
    try {
      await deleteProject(deleteProjectId);
      toast.success('Project deleted');
      setDeleteProjectId(null);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  // ── Members ──
  const openMembersDialog = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setMembersProjectId(id);
    setMemberSearch('');
    try {
      const { data } = await api.get('/users');
      setAllUsers(data.data ?? []);
    } catch {
      toast.error('Failed to load users');
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!membersProjectId) return;
    setAddingMember(true);
    try {
      await addMember(membersProjectId, userId);
      toast.success('Member added');
      setMemberSearch('');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!membersProjectId) return;
    try {
      await removeMember(membersProjectId, memberId);
      toast.success('Member removed');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to remove member');
    }
  };

  const membersProject = projects.find((p) => p._id === membersProjectId);
  const currentMemberIds = new Set((membersProject?.members ?? []).map((m: Member) => m._id));

  const filteredUsers = allUsers.filter((u) => {
    if (currentMemberIds.has(u._id)) return false; // already in project
    const q = memberSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const deleteTarget = projects.find((p) => p._id === deleteProjectId);

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>Create Project</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a new project board to start tracking tasks.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="proj-name" className="text-right">Name</Label>
                <Input
                  id="proj-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="col-span-3"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
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
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
          <p className="text-muted-foreground mb-4">No projects yet created.</p>
          <Button onClick={() => setIsCreateOpen(true)} variant="outline">
            Create your first project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {projects.map((project) => (
            <Link key={project._id} href={`/projects/${project._id}`}>
              <Card className="group h-full hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50 relative">
                {/* Action icons top-right */}
                <div
                  className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => e.preventDefault()}
                >
                  <button
                    onClick={(e) => openMembersDialog(e, project._id)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Manage members"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => openEditDialog(e, project._id, project.name, project.description)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit project"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => openDeleteDialog(e, project._id)}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <CardHeader className="p-5 pr-16">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {project.description || 'No description'}
                  </CardDescription>
                  {/* Member avatars */}
                  {project.members.length > 0 && (
                    <div className="flex -space-x-2 mt-3">
                      {project.members.slice(0, 5).map((m: Member) => (
                        <Avatar key={m._id} className="w-6 h-6 border-2 border-background">
                          <AvatarFallback className="text-[9px]">
                            {m.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.members.length > 5 && (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted border-2 border-background text-[9px] text-muted-foreground">
                          +{project.members.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* ══ Edit Project Dialog ══ */}
      <Dialog open={!!editProjectId} onOpenChange={(open) => !open && setEditProjectId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateProject()}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-desc" className="text-right">Description</Label>
              <Input
                id="edit-desc"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProjectId(null)} disabled={editing}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProject} disabled={editing}>
              {editing ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ Delete Project AlertDialog ══ */}
      <AlertDialog open={!!deleteProjectId} onOpenChange={(open) => !open && setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong> and all its tasks.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ══ Members Dialog ══ */}
      <Dialog open={!!membersProjectId} onOpenChange={(open) => !open && setMembersProjectId(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Manage Members</DialogTitle>
            <DialogDescription>
              Add or remove members from <strong>{membersProject?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          {/* Current members */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Current Members</p>
            {(membersProject?.members ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No members yet.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                {(membersProject?.members ?? []).map((m: Member) => (
                  <div key={m._id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/40">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="text-xs">
                          {m.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{m.name}</p>
                        <p className="text-xs text-muted-foreground">@{m.username}</p>
                      </div>
                    </div>
                    {/* Can't remove the creator (createdBy) */}
                    {m._id !== membersProject?.createdBy && (
                      <button
                        onClick={() => handleRemoveMember(m._id)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Remove member"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add member search */}
          <div className="space-y-2 mt-2">
            <p className="text-sm font-medium text-muted-foreground">Add Member</p>
            <Input
              placeholder="Search by name, username or email…"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2 text-center">
                  {memberSearch ? 'No users found.' : 'All users are already members.'}
                </p>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="text-xs">
                          {u.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{u.name}</p>
                        <p className="text-xs text-muted-foreground">@{u.username}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddMember(u._id)}
                      disabled={addingMember}
                    >
                      Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMembersProjectId(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
