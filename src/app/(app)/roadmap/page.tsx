"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/UserContext";
import { createRoadmapTask, getRoadmapTasksByStartup, updateRoadmapBoard } from "@/lib/db";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const columns = [
  { id: 'idea', title: 'Idea' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

type Task = {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  tag: string;
  status: string;
};

const KanbanCard = ({ task }: { task: Task }) => (
  <Card className="mb-2 cursor-grab active:cursor-grabbing">
    <CardContent className="p-3">
      <p className="font-medium mb-2">{task.title}</p>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            {/*<AvatarImage src={task.assignee} />*/}
            <AvatarFallback>{task.assignee?.[0]?.toUpperCase()??"A"}</AvatarFallback>
          </Avatar>
          <span>{task.dueDate}</span>
        </div>
        <Badge variant="secondary">{task.tag}</Badge>
      </div>
    </CardContent>
  </Card>
);

const KanbanColumn = ({ title, tasks }: { title: string; tasks: Task[] }) => (
  <div className="flex flex-col w-72 shrink-0">
    <div className="flex items-center justify-between mb-2 px-1">
      <h3 className="font-semibold">{title}</h3>
    </div>
    <div className="bg-muted/50 rounded-lg p-2 h-full">
      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center p-2">No tasks</p>
      ) : (
        tasks.map((task, index) => <KanbanCard key={task.id ?? `${task.title}-${index}`} task={task} />)
      )}
    </div>
  </div>
);

export default function RoadmapPage() {
  const { user, startupId } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    assignee: "",
    dueDate: "",
    tag: "",
    status: "idea"
  });

  const fetchTasks = async () => {
  if (!user || !startupId) return;

  const board = await getRoadmapTasksByStartup(startupId, user.$id);

  // ✅ If no board is found yet (i.e. first time), return empty tasks
  if (!board) {
    setTasks([]);
    return;
  }

  const flatTasks = Object.entries(board).flatMap(([status, tasks]: [string, any[]]) =>
    tasks.map((task) => ({
      ...task,
      status,
    }))
  );

  setTasks(flatTasks);
};


  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !startupId) {
      toast.error("User or startup not found. Please log in and select a startup.");
      return;
    }

    if (!form.title || !form.assignee || !form.dueDate || !form.tag) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      await updateRoadmapBoard({
  userId: user.$id,
  startupId,
  newTask: {
    title: form.title,
    assignee: form.assignee,
    dueDate: form.dueDate,
    tag: form.tag,
    status: form.status,
  }
});
toast.success("Task added!");
      setForm({ title: "", assignee: "", dueDate: "", tag: "", status: "idea" });
      setOpen(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add task");
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl">Roadmap</h1>
          <p className="text-muted-foreground">Visualize your project timeline and tasks.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>Add Column</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>This explains what the dialog does.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Tag</Label>
                  <Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Assignee Name</Label>
                  <Input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="border border-input rounded-md px-3 py-2"
                  >
                    {columns.map(col => (
                      <option key={col.id} value={col.id}>{col.title}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleSubmit}>Save Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {columns.map(col => (
          <KanbanColumn
            key={col.id}
            title={col.title}
            tasks={tasks.filter(t => t.status === col.id)}
          />
        ))}
      </div>
    </div>
  );
}
