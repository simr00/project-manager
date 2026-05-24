import type { Project } from "@/types";
import { getProjectProgress } from "@/lib";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";
import { getTaskStatusColor } from "@/lib";
import { Progress } from "../ui/progress";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  workspaceId: string;
}

export const ProjectCard = ({ project, workspaceId }: ProjectCardProps) => {
  // ✅ calculate INSIDE component
  const calculatedProgress = getProjectProgress(project.tasks || []);

  console.log("Tasks:", project.tasks);
  console.log("Progress:", calculatedProgress);

  return (
    <Link to={`/workspaces/${workspaceId}/projects/${project._id}`}>
      <Card className="transition-all duration-300 hover:shadow-md hover:translate-y-1">
        <CardHeader>
          <div className="flex items-center justify-between text-sm mt-2">
            <CardTitle>{project.title}</CardTitle>

            <span
              className={cn(
                "text-xs px-2 py-1 rounded-full whitespace-nowrap",
                getTaskStatusColor(project.status)
              )}
            >
              {project.status}
            </span>
          </div>

          <CardDescription className="line-clamp-2">
            {project.description || "No description"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            
            {/* ✅ Progress Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {calculatedProgress}%
                </span>
              </div>

              <Progress value={calculatedProgress} className="h-2 rounded-full" />
            </div>

            {/* Bottom Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <span>{project.tasks?.length || 0}</span>
                <span>
                  {project.tasks?.length === 1 ? "Task" : "Tasks"}
                </span>
              </div>

              {project.dueDate && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarDays className="w-4 h-4" />
                  <span className="ml-1">
                    {format(new Date(project.dueDate), "MMM d, yyyy")}
                  </span>
                </div>
              )}
            </div>

          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
