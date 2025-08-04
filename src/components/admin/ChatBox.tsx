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
  const [notice, setNotice] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const senderRef = useRef("Unknown");

  useEffect(() => {
    if (user?.username) {
      senderRef.current = user.username;
    }
  }, [user]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");
    socketRef.current = socket;

    socket.on("connect", () => console.log("✅ Connected to socket"));
    socket.on("connect_error", (err) => console.error("❌ Socket error:", err.message));

    socket.emit("joinRoom", { roomId });

    socket.on("previousMessages", (messages: ChatMessage[]) => setChat(messages));
    socket.on("receiveMessage", (data: ChatMessage) => setChat((prev) => [...prev, data]));

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

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
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        uploadedTile = res.data.tileUrl;
      } catch (error) {
        console.error("🚫 Tile upload failed:", error);
        return;
      }
    }

    socketRef.current?.emit("sendMessage", {
      roomId,
      message,
      tile: uploadedTile,
      sender: senderRef.current,
    });

    setMessage("");
    setTile(null);
  };

  const handleConfirmClear = () => {
    setChat([]);
    setNotice("Your chat view has been cleared.");
    setShowConfirm(false);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="relative bg-white border rounded p-4 shadow-md w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Chat Room: {roomId}</h3>
        <button
          onClick={() => setShowConfirm(true)}
          className="text-sm text-red-600 hover:underline"
        >
          Clear Chat
        </button>
      </div>

      {notice && <div className="text-green-600 text-sm mb-2 font-medium">{notice}</div>}

      <div className="h-80 overflow-y-auto border rounded p-3 mb-4 bg-gray-50 space-y-2">
        {chat.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">No messages yet</p>
        ) : (
          chat.map((item, idx) => {
            const isMe = item.sender === senderRef.current;
            return (
              <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg px-4 py-2 max-w-xs break-words shadow ${
                    isMe ? "bg-blue-600 text-white text-right" : "bg-gray-200 text-black"
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

      {showConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-5 rounded-lg shadow-md text-center space-y-4 max-w-sm w-full">
            <p className="text-md font-medium text-gray-800">
              Are you sure you want to clear your chat view?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirmClear}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}