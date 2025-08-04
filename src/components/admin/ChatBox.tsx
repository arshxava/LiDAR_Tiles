"use client";

import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import axios from "axios";

interface ChatMessage {
  message: string;
  tile?: string;
  sender: string;
}

interface ChatRoomProps {
  roomId: string;
  user: {
    username: string;
    email: string;
    role: string;
  };
}

export default function ChatRoom({ roomId, user }: ChatRoomProps) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [tile, setTile] = useState<File | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const senderRef = useRef("Unknown");

  useEffect(() => {
    console.log("👤 Received user prop:", user);
    if (user?.username) {
      senderRef.current = user.username;
      console.log("✅ senderRef set to:", senderRef.current);
    } else {
      console.warn("⚠️ user.name is missing");
    }
  }, [user]);

  // ✅ Connect to socket
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");
    socketRef.current = socket;

    console.log("🔌 Connecting to socket...");
    socket.on("connect", () => console.log("✅ Connected to socket:", socket.id));
    socket.on("connect_error", (err) => console.error("❌ Socket error:", err.message));

    socket.emit("joinRoom", { roomId });

    socket.on("previousMessages", (messages: ChatMessage[]) => {
      console.log("📜 Previous messages:", messages);
      setChat(messages);
    });

    socket.on("receiveMessage", (data: ChatMessage) => {
      console.log("📥 New message received:", data);
      setChat((prev) => [...prev, data]);
    });

    socket.on("clearChat", () => {
      console.log("🧹 Chat cleared");
      setChat([]);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // ✅ Handle sending message
  const handleSend = async () => {
    if (!message.trim() && !tile) return;

    let uploadedTile: string | null = null;

    if (tile) {
      const formData = new FormData();
      formData.append("tile", tile);

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/tiles/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        uploadedTile = res.data.tileUrl;
      } catch (error) {
        console.error("🚫 Tile upload failed:", error);
        return;
      }
    }

    const payload = {
      roomId,
      message,
      tile: uploadedTile,
      sender: senderRef.current,
    };

    console.log("📤 Emitting message:", payload);
    socketRef.current?.emit("sendMessage", payload);

    setMessage("");
    setTile(null);
  };

  // ✅ Handle clearing chat
  const handleClearChat = () => {
    if (confirm("Clear chat for everyone in this room?")) {
      console.log("🚨 Emitting clearChat for room:", roomId);
      socketRef.current?.emit("clearChat", { roomId });
    }
  };

  // ✅ Render
  return (
    <div className="bg-white border rounded p-4 shadow-md w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Chat Room: {roomId}</h3>
        <button
          onClick={handleClearChat}
          className="text-sm text-red-600 hover:underline"
        >
          Clear Chat
        </button>
      </div>

      <div className="h-80 overflow-y-auto border rounded p-3 mb-4 bg-gray-50 space-y-2">
        {chat.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">No messages yet</p>
        ) : (
          chat.map((item, idx) => {
            const isMe = item.sender === senderRef.current;
            console.log(`💬 Message ${idx}:`, item, " | isMe:", isMe);

            return (
              <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg px-4 py-2 max-w-xs break-words shadow ${
                    isMe
                      ? "bg-blue-600 text-white text-right"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  <p className="text-xs font-semibold mb-1">{item.sender}</p>
                  <p className="text-sm">{item.message}</p>
                  {item.tile && (
                    <img
                      src={item.tile}
                      alt="Tile"
                      className="mt-2 w-32 h-auto rounded border"
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message"
          className="flex-1 px-3 py-2 border rounded text-sm"
        />
        <input
          type="file"
          onChange={(e) => setTile(e.target.files?.[0] || null)}
          className="text-sm"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
