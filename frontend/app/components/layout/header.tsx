import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { Button } from "../ui/button";
import { Bell, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Link, useLocation, useNavigate } from "react-router";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";

import { useState, useEffect } from "react";

interface Notification {
  from: string;
  name: string;
  text: string;
  read: boolean;
}

interface HeaderProps {
  onWorkspaceSelected: (workspace: Workspace) => void;
  selectedWorkspace: Workspace | null;
  onCreateWorkspace: () => void;
  workspaces: Workspace[];
}

export const Header = ({
  onWorkspaceSelected,
  selectedWorkspace,
  onCreateWorkspace,
  workspaces,
}: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const locationHook = useLocation();

  const isOnWorkspacePage = locationHook.pathname.includes("/workspaces");

  // ✅ SINGLE SOURCE OF TRUTH
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // ✅ LOAD FROM LOCALSTORAGE
  useEffect(() => {
    const load = () => {
      const stored = localStorage.getItem("notifications");
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    };

    load();

    // ✅ LIVE UPDATE (important)
    const interval = setInterval(load, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOnClick = (workspace: Workspace) => {
    onWorkspaceSelected(workspace);
    const location = window.location;

    if (isOnWorkspacePage) {
      navigate(`/workspaces/${workspace._id}`);
    } else {
      const basePath = location.pathname;
      navigate(`${basePath}?workspaceId=${workspace._id}`);
    }
  };

  // 🔔 unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="bg-background sticky top-0 z-40 border-b">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">

        {/* WORKSPACE */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"outline"}>
              {selectedWorkspace ? (
                <>
                  {selectedWorkspace.color && (
                    <WorkspaceAvatar
                      color={selectedWorkspace.color}
                      name={selectedWorkspace.name}
                    />
                  )}
                  <span className="font-medium">{selectedWorkspace?.name}</span>
                </>
              ) : (
                <span className="font-medium">Select Workspace</span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuLabel>Workspace</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws._id}
                  onClick={() => handleOnClick(ws)}
                >
                  {ws.color && (
                    <WorkspaceAvatar color={ws.color} name={ws.name} />
                  )}
                  <span className="ml-2">{ws.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onCreateWorkspace}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Workspace
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">

          {/* 🔔 NOTIFICATIONS */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative cursor-pointer">
                <Button variant="ghost" size="icon">
                  <Bell />
                </Button>

                {/* 🔴 BADGE */}
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 text-[10px] bg-red-500 text-white px-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {notifications.length === 0 && (
                <div className="p-2 text-sm text-gray-500">
                  No notifications
                </div>
              )}

              {notifications.map((n, i) => (
         <DropdownMenuItem
  key={i}
  className={`flex justify-between items-start ${
    !n.read ? "bg-blue-50" : ""
  }`}
>
  {/* LEFT SIDE (click to open chat) */}
  <div
    className="flex flex-col flex-1 cursor-pointer"
    onClick={() => {
      const updated = notifications.map((item, idx) =>
        idx === i ? { ...item, read: true } : item
      );

      setNotifications(updated);
      localStorage.setItem("notifications", JSON.stringify(updated));

      navigate(`/chat/${n.from}`);
    }}
  >
    <div className="text-sm">
      <span className="font-semibold">{n.name}</span>
      <span className="text-gray-600"> sent: </span>
    </div>

    <div className="text-xs text-gray-500 truncate w-full">
      {n.text || "📎 Sent a file"}
    </div>
  </div>

  {/* RIGHT SIDE (3-dot menu) */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="px-2 text-gray-500 hover:text-black">
        ⋮
      </button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end">
      <DropdownMenuItem
        onClick={(e) => {
          e.stopPropagation(); // prevent opening chat

          const updated = notifications.filter((_, idx) => idx !== i);

          setNotifications(updated);
          localStorage.setItem(
            "notifications",
            JSON.stringify(updated)
          );
        }}
      >
        Remove
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* USER */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full border p-1 w-8 h-8">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profilePicture} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/user/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Log Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </div>
  );
};
