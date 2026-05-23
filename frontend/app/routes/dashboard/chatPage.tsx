// ✅ SAME IMPORTS
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, ArrowLeft } from "lucide-react";

const socket = io("https://project-manager-eeyj.onrender.com");

type User = {
  _id: string;
  name: string;
};

type Message = {
  sender: string;
  receiver: string;
  text?: string;
  file?: string;
  createdAt?: string;
  read?: boolean; // ✅ FIX
};

export default function ChatApp() {
  const navigate = useNavigate();
  const { workspaceId } = useParams();

  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const [unread, setUnread] = useState<Record<string, boolean>>(() => {
    const stored = localStorage.getItem("unread");
    return stored ? JSON.parse(stored) : {};
  });

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const usersRef = useRef<User[]>([]);
  const activeUserRef = useRef<User | null>(null);

  const BASE_URL = "https://project-manager-eeyj.onrender.com";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = user?._id;

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  useEffect(() => {
    localStorage.setItem("unread", JSON.stringify(unread));
  }, [unread]);

  // ================= SOCKET =================
  useEffect(() => {
    if (!myId) return;

    socket.emit("join", myId);

    socket.on("onlineUsers", setOnlineUsers);

    socket.on("receiveMessage", (msg: Message) => {
      if (msg.receiver !== myId) return;

      setMessages((prev) => ({
        ...prev,
        [msg.sender]: [...(prev[msg.sender] || []), msg],
      }));

      if (activeUserRef.current?._id !== msg.sender) {
        setUnread((prev) => ({
          ...prev,
          [msg.sender]: true,
        }));
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("onlineUsers");
    };
  }, [myId]);

  // ================= USERS =================
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(`${BASE_URL}/api-v1/users`, {
        credentials: "include",
      });
      const data = await res.json();
      setUsers(data.filter((u: User) => u._id !== myId));
    };
    fetchUsers();
  }, [myId]);

  // ================= FETCH MESSAGES =================
  const fetchMessages = async (userId: string) => {
    const res = await fetch(
      `${BASE_URL}/api-v1/messages/${userId}?myId=${myId}`,
      { credentials: "include" }
    );
    const data = await res.json();

    setMessages((prev) => ({
      ...prev,
      [userId]: Array.isArray(data) ? data : [],
    }));

    // ✅ FIX unread sync
    if (Array.isArray(data)) {
      const hasUnread = data.some(
        (m: Message) => m.receiver === myId && !m.read
      );

      setUnread((prev) => ({
        ...prev,
        [userId]: hasUnread,
      }));
    }
  };

  // ================= SELECT USER =================
  const handleSelectUser = async (user: User) => {
    setActiveUser(user);
    await fetchMessages(user._id);

    setUnread((prev) => ({
      ...prev,
      [user._id]: false,
    }));

    // ✅ backend sync
    await fetch(`${BASE_URL}/api-v1/messages/read/${user._id}`, {
      method: "PATCH",
      credentials: "include",
    });
  };

  // ================= SEND =================
  const sendMessage = async () => {
    if (!activeUser || (!input && !file)) return;

    let fileUrl = "";

    // ✅ RESTORED upload logic
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(`${BASE_URL}/api-v1/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const uploadData = await uploadRes.json();
      fileUrl = uploadData.url;
    }

    const msg: Message = {
      sender: myId,
      receiver: activeUser._id,
      text: input,
      file: fileUrl,
      createdAt: new Date().toISOString(),
    };

    socket.emit("sendMessage", msg);

    await fetch(`${BASE_URL}/api-v1/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
      credentials: "include",
    });

    setMessages((prev) => ({
      ...prev,
      [activeUser._id]: [...(prev[activeUser._id] || []), msg],
    }));

    setInput("");
    setFile(null);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* USERS */}
      <div className="w-full md:w-1/4 border-r bg-white flex flex-col">
        <div className="p-4 border-b flex justify-between">
          <h2>Users</h2>
          <Button onClick={() => navigate(`/dashboard?workspaceId=${workspaceId}`)}>
            Back
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => handleSelectUser(u)}
              className="p-4 cursor-pointer flex justify-between items-center border-b"
            >
              <span>{u.name}</span>

              {unread[u._id] && (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col">
        {!activeUser ? (
          <div className="flex items-center justify-center h-full">
            Start a conversation 💬
          </div>
        ) : (
          <>
            <div className="p-4 border-b flex gap-2">
              <Button onClick={() => setActiveUser(null)}>
                <ArrowLeft />
              </Button>
              {activeUser.name}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {(messages[activeUser._id] || []).map((msg, i) => (
                <div key={i} className="mb-2">
                  {msg.text && <div>{msg.text}</div>}

                  {/* ✅ SHOW FILE */}
                  {msg.file && (
                    <a
                      href={msg.file}
                      target="_blank"
                      className="text-blue-500 underline"
                    >
                      View File
                    </a>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              {/* ✅ FILE BUTTON */}
              <input
                type="file"
                id="fileInput"
                hidden
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              <Button onClick={() => document.getElementById("fileInput")?.click()}>
                <Paperclip />
              </Button>

              <Button onClick={sendMessage}>Send</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
