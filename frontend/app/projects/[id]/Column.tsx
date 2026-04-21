"use client"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTaskStore, Task } from "@/store/useTaskStore"
import { toast } from "sonner"
import TaskCard from "./TaskCard"

interface ColumnProps {
  id: string
  title: string
  tasks: Task[]
  projectId: string
}

export default function Column({ id, title, tasks, projectId }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id })
  const { createTask } = useTaskStore()

  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!newTitle.trim()) {
      setIsAdding(false)
      return
    }
    setLoading(true)
    try {
      await createTask({ title: newTitle, projectId, status: id })
      setNewTitle("")
      setIsAdding(false)
    } catch {
      toast.error("Failed to create task")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-80 shrink-0 flex-col">
      <div className="flex flex-col rounded-xl bg-muted/50 p-3">
        {/* Column header */}
        <div className="mb-3 flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold tracking-wide text-foreground/80 uppercase">
            {title}
          </h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {tasks.length}
          </span>
        </div>

        {/* Drop zone */}
        <div ref={setNodeRef} className="flex min-h-25 flex-col gap-2">
          <SortableContext
            items={tasks.map((t) => t._id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task, index) => (
              <TaskCard key={index} task={task} />
            ))}
          </SortableContext>
        </div>

        {/* Add card */}
        {isAdding ? (
          <div className="mt-2 flex flex-col gap-2">
            <Input
              autoFocus
              placeholder="Card title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="bg-background"
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={loading}>
                {loading ? "…" : "Add card"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={() => setIsAdding(true)}
            className="mt-2 w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add a card
          </Button>
        )}
      </div>
    </div>
  )
}
