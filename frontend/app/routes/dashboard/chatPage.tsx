import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Check,ArrowLeft } from "lucide-react";

const socket = io("https://project-manager-eeyj.onrender.com/");

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
  const [typing, setTyping] = useState(false);

 const [unread, setUnread] = useState<Record<string, boolean>>(() => {
  const stored = localStorage.getItem("unread");
  return stored ? JSON.parse(stored) : {};
});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const BASE_URL = "https://project-manager-eeyj.onrender.com/";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = user?._id;

  const getFileName = (url: string) => url.split("/").pop();

  const getFileIcon = (url: string) => {
    if (url.match(/\.pdf$/i)) return "📄";
    if (url.match(/\.doc|\.docx$/i)) return "📝";
    if (url.match(/\.ppt|\.pptx$/i)) return "📊";
    if (url.match(/\.zip|\.rar$/i)) return "🗜️";
    if (url.match(/\.xls|\.xlsx$/i)) return "📈";
    return "📎";
  };
  const [notifications, setNotifications] = useState<
  { from: string; name: string; text: string; read: boolean }[]
>([]);
// 🔥 ADD THIS (below your states)
const activeUserRef = useRef<User | null>(null);

// 🔥 KEEP THIS SYNCED
useEffect(() => {
  localStorage.setItem("unread", JSON.stringify(unread));
}, [unread]);
  // SOCKET
  useEffect(() => {
    if (myId) socket.emit("join", myId);

    socket.on("onlineUsers", setOnlineUsers);

socket.on("receiveMessage", (msg: Message) => {
  setMessages((prev) => ({
    ...prev,
    [msg.sender]: [...(prev[msg.sender] || []), msg],
  }));
  

  // 🔵 unread dot
  if (
    msg.receiver === myId &&
    activeUserRef.current?._id !== msg.sender
  ) {
    setUnread((prev) => ({
      ...prev,
      [msg.sender]: true,
    }));

    // 🔔 ADD NOTIFICATION
    const senderUser = users.find((u) => u._id === msg.sender);

   setNotifications((prev) => {
  const updated = [
    {
      from: msg.sender,
      name: senderUser?.name || "User",
      text: msg.text || "Sent a file",
      read: false,
    },
    ...prev,
  ];

  // ✅ SAVE TO LOCALSTORAGE
  localStorage.setItem("notifications", JSON.stringify(updated));

  return updated;
});
  }
});

    socket.on("typing", () => {
      setTyping(true);
      setTimeout(() => setTyping(false), 1500);
    });

    return () => socket.off();
  }, [myId, activeUser]);

  // USERS
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(`${BASE_URL}/api-v1/users`);
      const data = await res.json();
      setUsers(data.filter((u: User) => u._id !== myId));
    };
    fetchUsers();
  }, [myId]);

  const fetchMessages = async (userId: string) => {
    const res = await fetch(
      `${BASE_URL}/api-v1/messages/${userId}?myId=${myId}`
    );
    const data = await res.json();

    setMessages((prev) => ({
      ...prev,
      [userId]: Array.isArray(data) ? data : [],
    }));
  };

  const handleSelectUser = (user: User) => {
    setActiveUser(user);
    fetchMessages(user._id);

    setUnread((prev) => ({
      ...prev,
      [user._id]: false,
    }));
  };

  const sendMessage = async () => {
    if (!activeUser || (!input && !file)) return;

    let fileUrl = "";

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(`${BASE_URL}/api-v1/upload`, {
        method: "POST",
        body: formData,
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

      {/* IMAGE VIEW */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black flex flex-col z-50">
          <div className="p-4">
            <Button onClick={() => setSelectedImage(null)}>Back</Button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <img src={selectedImage} className="max-h-[90%]" />
          </div>
        </div>
      )}

      {/* USERS */}
      <div className="w-full md:w-1/4 border-r bg-white flex flex-col">
        <div className="p-4 border-b flex justify-between">
          <h2>Users</h2>
          <Button onClick={() => navigate(`/dashboard?workspaceId=${workspaceId}`)}>
            Back
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {users.map((u) => {
            const isOnline = onlineUsers.includes(u._id);

            return (
              <div
                key={u._id}
                onClick={() => handleSelectUser(u)}
                className={`p-4 cursor-pointer flex justify-between items-center border-b ${
                  activeUser?._id === u._id
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
              >
                <span>{u.name}</span>

                <div className="flex items-center gap-2">
                  {unread[u._id] && (
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                  )}

                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isOnline ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </div>
              </div>
            );
          })}
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
            {/* ✅ FIXED HEADER WITH BACK BUTTON */}
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
               <Button
  size="icon"
  variant="ghost"
  onClick={() => setActiveUser(null)}
>
  <ArrowLeft className="w-5 h-5" />
</Button>
                <span>{activeUser.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {onlineUsers.includes(activeUser._id)
                    ? "Online"
                    : "Offline"}
                </span>

                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    onlineUsers.includes(activeUser._id)
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4">
              {(messages[activeUser._id] || []).map((msg, i) => (
                <div
                  key={i}
                  className={`mb-3 flex ${
                    msg.sender === myId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="bg-gray-200 px-4 py-2 rounded-2xl max-w-xs">

                    {msg.text}

                    {msg.file && (
                      <div className="mt-2">
                        {msg.file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img
                            src={msg.file}
                            className="max-w-[200px] rounded-lg cursor-pointer"
                            onClick={() => setSelectedImage(msg.file!)}
                          />
                        ) : (
                          <div
                            className="border rounded-lg p-2 flex gap-2 bg-gray-100 cursor-pointer"
                            onClick={() => window.open(msg.file)}
                          >
                            <span>{getFileIcon(msg.file)}</span>
                            <span className="text-sm truncate">
                              {getFileName(msg.file)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-xs mt-1">
                      {msg.createdAt &&
                        new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 border-t flex gap-2 items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type message..."
              />

              <label className="cursor-pointer w-10 h-10 flex items-center justify-center border rounded">
                {file ? <Check /> : <Paperclip />}
                <input
                  type="file"
                  hidden
                  onChange={(e) =>
                    setFile(e.target.files?.[0] || null)
                  }
                />
              </label>

              <Button onClick={sendMessage}>Send</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
