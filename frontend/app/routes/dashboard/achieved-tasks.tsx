import { useMemo, useState } from "react";
import { Loader } from "@/components/loader";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useGetMyTasksQuery } from "@/hooks/use-task";
import type { Task } from "@/types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FilterIcon, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

const AchievedTasks = () => {
  const { data, isLoading } = useGetMyTasksQuery();
  const tasks: Task[] = data || [];

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  // 📅 FORMAT DATE
  const formatDate = (date?: string) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 🔧 MAIN LOGIC
  const achievedTasks = useMemo(() => {
    let filtered = tasks.filter((t) => t.isArchived);

    // 🔍 search
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
    );

    // 📅 filter
    if (filter === "today") {
      const today = new Date().toDateString();
      filtered = filtered.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate).toDateString() === today
      );
    }

    if (filter === "week") {
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());

      filtered = filtered.filter(
        (t) => t.dueDate && new Date(t.dueDate) >= start
      );
    }

    // 🔃 sort
    if (sort === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.dueDate || "").getTime() -
          new Date(a.dueDate || "").getTime()
      );
    }

    if (sort === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.dueDate || "").getTime() -
          new Date(b.dueDate || "").getTime()
      );
    }

    if (sort === "az") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [tasks, search, filter, sort]);

  // 📊 BOARD GROUPING
  const grouped = {
    todo: achievedTasks.filter((t) =>
      t.status.toLowerCase().includes("to do")
    ),
    inProgress: achievedTasks.filter((t) =>
      t.status.toLowerCase().includes("progress")
    ),
    done: achievedTasks.filter((t) =>
      t.status.toLowerCase().includes("done")
    ),
  };

  if (isLoading) return <Loader />;

  return (
    <div className="p-6 space-y-6">

      {/* 🔥 HEADER */}
<div className="flex flex-col gap-4">

  {/* TOP ROW */}
  <div className="flex justify-between items-center">
    <h1 className="text-2xl font-semibold">Archieved Tasks</h1>

    <div className="flex items-center gap-3">

      {/* SORT */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="rounded-full px-4 py-2 bg-white shadow-sm"
          >
            {sort === "newest" && "Newest First"}
            {sort === "oldest" && "Oldest First"}
            {sort === "az" && "A-Z"}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setSort("newest")}>
            Newest First
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSort("oldest")}>
            Oldest First
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSort("az")}>
            A-Z
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* FILTER */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="rounded-full px-4 py-2 bg-white shadow-sm"
          ><FilterIcon className="w-4 h-4" />
            Filter
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setFilter("all")}>
            All
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFilter("today")}>
            Due Today
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFilter("week")}>
            This Week
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  </div>

  {/* 🔍 SEARCH BAR */}
  <div className="w-full">
    <Input
        placeholder="Search tasks ...."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />
  </div>

</div>

      {/* 🔄 TABS */}
      <Tabs defaultValue="list">

        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Board View</TabsTrigger>
        </TabsList>

        {/* 📋 LIST VIEW */}
        <TabsContent value="list">
          <div className="border rounded-2xl p-6 space-y-4 shadow-sm">

            <h2 className="text-lg font-semibold">Archived Tasks</h2>
            <p className="text-sm text-gray-500">
              {achievedTasks.length} tasks archived
            </p>

            {achievedTasks.map((task) => (
              <div
                key={task._id}
                className="flex justify-between items-center border-t pt-4"
              >
                {/* LEFT */}
                <div>
                  <div className="flex items-center gap-2">

                    {/* 🔥 NEUTRAL DOT (NOT TICK) */}
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>

                    <p className="font-medium">{task.title}</p>
                  </div>

                  <div className="flex gap-2 mt-1 text-xs">

                    <span className="px-2 py-1 rounded-2xl bg-gray-200 text-gray-700">
                      {task.status}
                    </span>

                    {task.priority && (
                      <span className="px-2 py-1 rounded-2xl bg-red-100 text-red-600">
                        {task.priority}
                      </span>
                    )}

                    <span className="px-2 py-1 rounded-2xl border text-gray-600">
                      Archived
                    </span>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="text-sm text-gray-500 text-right">
                  <p>Due: {formatDate(task.dueDate)}</p>

                  <p>
                    Project:{" "}
                    {task.project?.name ||
                      task.project?.title ||
                      "No Project"}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </TabsContent>

        {/* 📊 BOARD VIEW */}
        <TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {[
              { title: "To Do", data: grouped.todo },
              { title: "In Progress", data: grouped.inProgress },
              { title: "Done", data: grouped.done },
            ].map((col) => (
              <div key={col.title} className="border rounded-2xl p-4">
                <h2 className="font-semibold mb-3">{col.title}</h2>

                {col.data.length === 0 ? (
                  <p className="text-sm text-gray-400">No tasks</p>
                ) : (
                  col.data.map((task) => (
                    <div
                      key={task._id}
                      className="p-3 border rounded-2xl mb-2"
                    >
                      <p>{task.title}</p>

                      <p className="text-xs text-gray-500">
                        {formatDate(task.dueDate)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ))}

          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default AchievedTasks;