import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../services/socket";

function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // New state to track who is typing
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]); // Also scroll when the typing indicator appears

  useEffect(() => {
    socket.emit("joinRoom", {
      roomId,
      username: user.username,
    });

    socket.emit("loadMessages", roomId);

    socket.on("messageHistory", (data) => {
      setMessages(data);
    });

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    // --- NEW: Typing Event Listeners ---
    socket.on("typing", (data) => {
      if (data.username !== user.username) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.username)) return [...prev, data.username];
          return prev;
        });
      }
    });

    socket.on("stopTyping", (data) => {
      setTypingUsers((prev) => prev.filter((name) => name !== data.username));
    });

    return () => {
      socket.off("messageHistory");
      socket.off("newMessage");
      socket.off("onlineUsers");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [roomId, user.username]);

  // --- NEW: Handle input changes and emit typing events ---
  const handleTyping = (e) => {
    setMessage(e.target.value);

    // Tell the server we are typing
    socket.emit("typing", { roomId, username: user.username });

    // Clear the previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing automatically after 1.5 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { roomId, username: user.username });
    }, 1500);
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("chatMessage", {
      roomId,
      userId: user.id,
      content: message,
    });

    setMessage("");
    
    // Immediately clear typing state when message is sent
    socket.emit("stopTyping", { roomId, username: user.username });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden font-sans">
      
      {/* Sidebar - Online Users */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10 hidden md:flex">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Online — {onlineUsers.length}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {onlineUsers.map((onlineUser, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {onlineUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 truncate">
                {onlineUser.username}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Header */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-indigo-500">#</span>
                {roomId}
              </h1>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg, index) => {
            const isMe = msg.sender?._id === user.id || msg.sender?.username === user.username;

            return (
              <div
                key={msg._id || index}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                {!isMe && (
                  <span className="text-xs text-gray-500 mb-1 ml-1 font-medium">
                    {msg.sender?.username}
                  </span>
                )}
                <div
                  className={`max-w-[75%] md:max-w-[60%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            );
          })}

          {/* --- NEW: Typing Indicator UI --- */}
          {typingUsers.length > 0 && (
            <div className="flex items-end gap-2">
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 w-fit">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-xs text-gray-500 font-medium mb-1 ml-1">
                {typingUsers.length === 1 
                  ? `${typingUsers[0]} is typing...` 
                  : `${typingUsers.join(', ')} are typing...`}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4 sm:p-6">
          <div className="max-w-4xl mx-auto flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                rows="1"
                placeholder="Type a message..."
                value={message}
                onChange={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-none overflow-hidden"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="mb-0.5 flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex-shrink-0"
            >
              <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V6m0 0l-8 8m8-8l8 8"></path>
              </svg>
            </button>
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">
            Press <kbd className="font-sans px-1 bg-gray-100 rounded border border-gray-200 text-gray-500">Enter</kbd> to send, <kbd className="font-sans px-1 bg-gray-100 rounded border border-gray-200 text-gray-500">Shift + Enter</kbd> for a new line.
          </p>
        </div>

      </div>
    </div>
  );
}

export default ChatRoom;