import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Lock, MessageCircle, Send, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { RoleBadge } from "../components/RoleBadge";
import { UserAvatar } from "../components/UserAvatar";
import { useApp } from "../context/AppContext";
import type { ChatMessage } from "../types/campus";
import { formatTimeAgo, generateId } from "../utils/helpers";
import { getChatMessages, saveChatMessages } from "../utils/storage";

export function ChatPage() {
  const {
    currentUser,
    activeChatUser,
    setActiveChatUser,
    friends,
    setActiveTab,
  } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const principalId = currentUser?.principalId ?? "me";

  // Load messages when chat user changes
  useEffect(() => {
    if (!activeChatUser) {
      setMessages([]);
      return;
    }
    const loaded = getChatMessages(activeChatUser).map((m) => ({
      ...m,
      senderId: m.senderId === "me" ? principalId : m.senderId,
    }));
    setMessages(loaded);
  }, [activeChatUser, principalId]);

  // Scroll to bottom on new messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || !activeChatUser || !currentUser) return;
    // Only allow if this is an actual friend
    if (!friends.some((f) => f.principalId === activeChatUser)) return;

    const newMsg: ChatMessage = {
      id: generateId(),
      senderId: principalId,
      receiverId: activeChatUser,
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputText("");

    // Save to storage
    const forStorage = updatedMessages.map((m) => ({
      ...m,
      senderId: m.senderId === principalId ? "me" : m.senderId,
    }));
    saveChatMessages(activeChatUser, forStorage);
  }

  const activeUser = friends.find((f) => f.principalId === activeChatUser);
  const isFriend = activeChatUser
    ? friends.some((f) => f.principalId === activeChatUser)
    : false;
  const isMobileViewingChat = activeChatUser !== null;

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      {/* Friends list panel */}
      <div
        className={`w-full lg:w-72 border-r border-[oklch(0.92_0.015_250)] bg-white flex-shrink-0 flex flex-col ${isMobileViewingChat ? "hidden lg:flex" : "flex"}`}
      >
        <div className="p-4 border-b border-[oklch(0.93_0.01_250)]">
          <h2 className="font-display font-bold text-base text-[oklch(0.17_0.025_260)]">
            Messages
          </h2>
          <p className="text-xs text-[oklch(0.55_0.03_255)] mt-0.5">
            {friends.length} friend{friends.length !== 1 ? "s" : ""}
          </p>
        </div>

        {friends.length === 0 ? (
          /* Empty friends state */
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[oklch(0.93_0.04_265)] flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-[oklch(0.42_0.18_265)]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[oklch(0.25_0.04_260)]">
                No friends yet
              </p>
              <p className="text-xs text-[oklch(0.55_0.03_255)] mt-1 leading-relaxed">
                Go to Student Directory to send friend requests
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("directory")}
              className="text-xs text-[oklch(0.42_0.18_265)] hover:underline font-medium"
            >
              Find Friends →
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {friends.map((friend) => {
              const isActive = activeChatUser === friend.principalId;
              const lastMessages = getChatMessages(friend.principalId);
              const lastMsg = lastMessages[lastMessages.length - 1];
              return (
                <button
                  type="button"
                  key={friend.principalId}
                  onClick={() => setActiveChatUser(friend.principalId)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[oklch(0.97_0.005_250)] transition-colors text-left border-b border-[oklch(0.96_0.005_250)] ${isActive ? "bg-[oklch(0.95_0.02_265)]" : ""}`}
                >
                  <div className="relative flex-shrink-0">
                    <UserAvatar
                      name={friend.name}
                      avatarUrl={friend.avatarUrl}
                      size="md"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[oklch(0.2_0.04_260)] truncate">
                        {friend.name}
                      </p>
                      {lastMsg && (
                        <span className="text-[10px] text-[oklch(0.6_0.02_255)] flex-shrink-0 ml-1">
                          {formatTimeAgo(lastMsg.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <RoleBadge
                        role={friend.role}
                        className="text-[9px] px-1.5 py-0"
                      />
                      {lastMsg ? (
                        <p className="text-xs text-[oklch(0.58_0.03_255)] truncate max-w-[100px]">
                          {lastMsg.content}
                        </p>
                      ) : (
                        <p className="text-xs text-[oklch(0.68_0.02_255)] truncate max-w-[100px]">
                          {friend.course}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat area */}
      <div
        className={`flex-1 flex flex-col bg-[oklch(0.98_0.003_250)] ${!isMobileViewingChat ? "hidden lg:flex" : "flex"}`}
      >
        {activeChatUser && activeUser ? (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-[oklch(0.92_0.015_250)] px-4 py-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveChatUser(null)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-[oklch(0.95_0.01_250)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-[oklch(0.3_0.04_260)]" />
              </button>
              <div className="relative flex-shrink-0">
                <UserAvatar
                  name={activeUser.name}
                  avatarUrl={activeUser.avatarUrl}
                  size="sm"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[oklch(0.2_0.04_260)]">
                  {activeUser.name}
                </p>
                <div className="flex items-center gap-1.5">
                  <RoleBadge role={activeUser.role} className="text-[10px]" />
                  {activeUser.course && (
                    <span className="text-xs text-[oklch(0.6_0.02_255)]">
                      {activeUser.course}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.senderId === principalId;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}
                  >
                    {!isMe && activeUser && (
                      <UserAvatar
                        name={activeUser.name}
                        avatarUrl={activeUser.avatarUrl}
                        size="sm"
                      />
                    )}
                    <div
                      className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}
                    >
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? "bg-[oklch(0.42_0.18_265)] text-white rounded-br-sm"
                            : "bg-white text-[oklch(0.22_0.03_260)] border border-[oklch(0.93_0.01_250)] rounded-bl-sm shadow-xs"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-[oklch(0.62_0.02_255)] px-1">
                        {formatTimeAgo(msg.timestamp)}
                      </span>
                    </div>
                    {isMe && currentUser && (
                      <UserAvatar
                        name={currentUser.name}
                        avatarUrl={currentUser.avatarUrl}
                        size="sm"
                      />
                    )}
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input — locked if not a friend (edge case guard) */}
            {isFriend ? (
              <form
                onSubmit={handleSend}
                className="bg-white border-t border-[oklch(0.92_0.015_250)] p-3 flex gap-2"
              >
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${activeUser.name}...`}
                  className="flex-1 rounded-xl border-[oklch(0.9_0.015_250)] focus-visible:ring-[oklch(0.42_0.18_265)] h-10"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-10 h-10 p-0 rounded-xl bg-[oklch(0.42_0.18_265)] hover:bg-[oklch(0.38_0.18_265)] text-white flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <div className="bg-white border-t border-[oklch(0.92_0.015_250)] p-4 flex items-center justify-center gap-2 text-[oklch(0.55_0.03_255)]">
                <Lock className="w-4 h-4" />
                <span className="text-sm">
                  You need to be friends to send messages
                </span>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
            <div className="w-16 h-16 rounded-2xl bg-[oklch(0.93_0.04_265)] flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-[oklch(0.42_0.18_265)]" />
            </div>
            <div className="text-center">
              <h3 className="font-display font-bold text-base text-[oklch(0.25_0.04_260)]">
                {friends.length > 0
                  ? "Select a conversation"
                  : "No friends yet"}
              </h3>
              <p className="text-sm text-[oklch(0.55_0.03_255)] mt-1">
                {friends.length > 0
                  ? "Choose from your friends to start chatting"
                  : "Send friend requests from the Student Directory first"}
              </p>
            </div>
            {friends.length === 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("directory")}
                className="text-sm text-[oklch(0.42_0.18_265)] hover:underline font-medium"
              >
                Go to Directory →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
