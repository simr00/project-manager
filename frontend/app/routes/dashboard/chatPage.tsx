// ONLY CHANGE IS INSIDE SOCKET useEffect

useEffect(() => {
  if (myId) socket.emit("join", myId);

  socket.on("onlineUsers", setOnlineUsers);

  socket.on("receiveMessage", (msg: Message) => {
    if (msg.receiver !== myId) return;

    // ✅ FIX: force proper state update
    setMessages((prev) => {
      const updated = {
        ...prev,
        [msg.sender]: [...(prev[msg.sender] || []), msg],
      };
      return updated;
    });

    // ✅ FIX: instant scroll (forces UI refresh feel)
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    // unread logic (unchanged)
    if (activeUserRef.current?._id !== msg.sender) {
      setUnread((prev) => ({
        ...prev,
        [msg.sender]: true,
      }));

      const senderUser = usersRef.current.find(
        (u) => u._id === msg.sender
      );

      setNotifications((prev: any) => [
        {
          from: msg.sender,
          name: senderUser?.name || "User",
          text: msg.text || "Sent a file",
          read: false,
        },
        ...prev,
      ]);
    }
  });

  socket.on("typing", () => {
    setTyping(true);
    setTimeout(() => setTyping(false), 1500);
  });

  return () => {
    socket.off();
  };
  
// ✅ CRITICAL FIX HERE
}, [myId, activeUser]);
