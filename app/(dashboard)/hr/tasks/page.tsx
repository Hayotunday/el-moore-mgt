"use client";

import RoleGuard from "@/components/role-guard";
import { taskRoster } from "@/lib/dashboardMockData";
import { Edit, Trash2, CheckCircle2 } from "lucide-react";

function getPriorityColor(priority: string) {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-700";
    case "Medium":
      return "bg-yellow-100 text-yellow-700";
    case "Low":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700";
    case "In Progress":
      return "bg-blue-100 text-blue-700";
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function TaskRosterPage() {
  const completedTasks = taskRoster.filter(
    (task) => task.status === "Completed"
  ).length;
  const inProgressTasks = taskRoster.filter(
    (task) => task.status === "In Progress"
  ).length;
  const pendingTasks = taskRoster.filter(
    (task) => task.status === "Pending"
  ).length;

  return (
    <RoleGuard allowedRoles={["hr_staff"]}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Task Roster
            </h1>
            <p className="text-muted-foreground mt-2">
              Assign and track team tasks
            </p>
          </div>
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
            Create Task
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Total Tasks
            </p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {taskRoster.length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              In Progress
            </p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {inProgressTasks}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Pending
            </p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {pendingTasks}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Completed
            </p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {completedTasks}
            </p>
          </div>
        </div>

        {/* Task Cards */}
        <div className="space-y-4">
          {taskRoster.map((task) => (
            <div
              key={task.id}
              className="rounded-lg border border-border bg-background p-6 space-y-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-foreground">
                      {task.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority} Priority
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Assigned to:</span>{" "}
                      <span className="text-foreground font-medium">
                        {task.assignee}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Due Date:</span>{" "}
                      <span className="text-foreground">{task.dueDate}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Edit task"
                  >
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}
