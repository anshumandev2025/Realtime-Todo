"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocket } from '@/hooks/useSocket';
import { useTasks } from '@/hooks/useTasks';
import { DndContext, closestCorners, DragOverlay } from '@dnd-kit/core';
import { useParams } from 'next/navigation';
import TaskCard from './TaskCard';
import Column from './Column';
import { useProjects } from '@/hooks/useProjects';

export default function ProjectBoardPage() {
  const params = useParams();
  const projectId = params.id as string;
  const {currentProjectName}=useProjects();
  const projectName=currentProjectName(projectId);
  const { isAuthenticated } = useAuthStore();
  const { moveTask, fetchTasks, isLoading, tasks, setTasks } = useTasks();

  // useSocket wires all real-time events (task:create/update/move/delete) via the store
  useSocket(projectId);

  const [activeTask, setActiveTask] = useState<any | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
    }
  }, [projectId, fetchTasks]);

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveTask(tasks.find((t) => t._id === active.id) || null);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find if over is a column or a task
    const isOverAColumn = overId === 'todo' || overId === 'in-progress' || overId === 'done';

    // Compute new status
    let newStatus: string = '';
    if (isOverAColumn) {
      newStatus = overId;
    } else {
      const overTask = tasks.find((t) => t._id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (!newStatus) return;

    // Local Optimistic Update
    const activeIndex = tasks.findIndex((t) => t._id === activeId);
    if (activeIndex === -1) return;

    const currentTask = tasks[activeIndex];

    if (currentTask.status !== newStatus) {
      const updatedTasks = [...tasks];
      updatedTasks[activeIndex] = { ...currentTask, status: newStatus };
      setTasks(updatedTasks);

      // Fire API (socket broadcast happens server-side via task:move event)
      moveTask(activeId, projectId, newStatus, 0);
    }
  };

  if (!isAuthenticated) return <div className="p-8">Please log in.</div>;
  if (isLoading) return <div className="p-8 text-muted-foreground animate-pulse">Loading board…</div>;

  const columns = ['todo', 'in-progress', 'done'];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden bg-muted/10">
      <div className="p-4 border-b bg-background shadow-sm flex items-center justify-between">
        <h2 className="text-xl font-bold">{projectName}</h2>
      </div>

      <div className="flex-1 overflow-x-auto p-4 md:p-8">
        <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-6 h-full items-start">
            {columns.map((colId) => (
              <Column
                key={colId}
                id={colId}
                title={colId.replace('-', ' ').toUpperCase()}
                tasks={tasks.filter((t) => t.status === colId)}
                projectId={projectId}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
