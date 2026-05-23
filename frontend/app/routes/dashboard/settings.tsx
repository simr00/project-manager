import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { toast } from "sonner";

const COLORS = [
  "#FF5733",
  "#3B82F6",
  "#22C55E",
  "#EAB308",
  "#A855F7",
  "#F97316",
  "#10B981",
  "#334155",
];

export default function WorkspaceSettings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const id = searchParams.get("workspaceId");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#FF5733");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [openDelete, setOpenDelete] = useState(false); // 🔥 modal state

  const token = localStorage.getItem("token");
  const API = "http://localhost:5000";

  // 🔹 Fetch
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        if (!id) return;

        const res = await axios.get(`${API}/api-v1/workspaces/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data.workspace || res.data;

        setName(data.name || "");
        setDescription(data.description || "");
        setColor(data.color || "#FF5733");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [id]);

  // 🔹 Update
  const handleUpdate = async () => {
    try {
      setUpdating(true);

      await axios.put(
        `${API}/api-v1/workspaces/${id}`,
        { name, description, color },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Workspace updated successfully");
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setUpdating(false);
    }
  };

  // 🔹 Delete
  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/api-v1/workspaces/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Workspace deleted");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  if (loading) return null;

  return (
    <div className="flex justify-center items-start min-h-screen pt-10 bg-gray-50">
      <div className="w-full max-w-2xl space-y-6">

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Workspace Settings</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your workspace settings and preferences
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Name */}
            <div>
              <label className="text-sm font-medium">Workspace Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Color */}
            <div>
              <label className="text-sm font-medium">Workspace Color</label>

              <div className="flex gap-3 mt-3">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 ${
                      color === c
                        ? "border-black scale-110 ring-2 ring-black"
                        : "border-gray-200"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end">
              <Button onClick={handleUpdate} disabled={updating}>
                {updating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <p className="text-sm text-muted-foreground">
              Irreversible actions for your workspace
            </p>
          </CardHeader>

          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setOpenDelete(true)}
            >
              Delete Workspace
            </Button>
          </CardContent>
        </Card>

        {/* 🔥 DELETE MODAL */}
        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Delete Workspace
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. This will permanently delete your workspace.
              </p>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpenDelete(false)}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  handleDelete();
                  setOpenDelete(false);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}