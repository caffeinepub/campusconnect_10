import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Loader2,
  Lock,
  MessageCircle,
  Send,
  UserPlus,
  Wifi,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { RoleBadge } from "../components/RoleBadge";
import { UserAvatar } from "../components/UserAvatar";
import { useApp } from "../context/AppContext";
import type { ChatMessage } from "../types/campus";
import { formatTimeAgo, generateId } from "../utils/helpers";

export function ChatPage() {
  const {
    currentUser,
    activeChatUser,
    setActiveChatUser,
    friends,
    setActiveTab,
    actor,
  } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const principalId = currentUser?.principalId ?? "";

  /** Fetch messages from backend for the active conversation */
  const loadMessagesFromBackend = useCallback(async () => {
    if (!actor || !activeChatUser) return;
    try {
      const backendMsgs = await actor.getChatMessagesWith(activeChatUser);
      const local: ChatMessage[] = backendMsgs.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        content: m.content,
        timestamp: Number(m.timestamp),
      }));
      // Sort by timestamp ascending
      local.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(local);
    } catch {
      // silently ignore polling errors
    }
  }, [actor, activeChatUser]);

  // Load messages when chat user changes
  useEffect(() => {
    if (!activeChatUser) {
      setMessages([]);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }
    if (!actor) return;

    setLoadingMessages(true);
    loadMessagesFromBackend().finally(() => setLoadingMessages(false));

    // Poll every 8s for new messages
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(loadMessagesFromBackend, 8000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeChatUser, actor, loadMessagesFromBackend]);

  // Scroll to bottom on new messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || !activeChatUser || !currentUser || !actor) return;
    // Only allow if this is an actual friend
    if (!friends.some((f) => f.principalId === activeChatUser)) return;

    const trimmed = inputText.trim();
    const newMsg: ChatMessage = {
      id: generateId(),
      senderId: principalId,
      receiverId: activeChatUser,
      content: trimmed,
      timestamp: Date.now(),
    };

    // Optimistic update
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    try {
      await actor.sendChatMessage({
        id: newMsg.id,
        senderId: principalId,
        receiverId: activeChatUser,
        content: trimmed,
        timestamp: BigInt(newMsg.timestamp),
      });
    } catch {
      // If backend fails, remove the optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== newMsg.id));
      setInputText(trimmed);
    }
  }

  const activeUser = friends.find((f) => f.principalId === activeChatUser);
  const isFriend = activeChatUser
    ? friends.some((f) => f.principalId === activeChatUser)
    : false;
  const isMobileViewingChat = activeChatUser !== null;
  const isActorReady = !!actor;

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
          <div
            data-ocid="chat.empty_state"
            className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center"
          >
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
              data-ocid="chat.directory.link"
              className="text-xs text-[oklch(0.42_0.18_265)] hover:underline font-medium"
            >
              Find Friends →
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {friends.map((friend, index) => {
              const isActive = activeChatUser === friend.principalId;
              return (
                <button
                  type="button"
                  key={friend.principalId}
                  data-ocid={`chat.friend.item.${index + 1}`}
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
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <RoleBadge
                        role={friend.role}
                        className="text-[9px] px-1.5 py-0"
                      />
                      <p className="text-xs text-[oklch(0.68_0.02_255)] truncate max-w-[100px]">
                        {friend.course}
                      </p>
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
                data-ocid="chat.back.button"
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
              {loadingMessages ? (
                <div
                  data-ocid="chat.messages.loading_state"
                  className="flex items-center justify-center py-8 gap-2 text-[oklch(0.55_0.03_255)]"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div
                  data-ocid="chat.messages.empty_state"
                  className="flex flex-col items-center justify-center py-12 gap-2 text-center"
                >
                  <MessageCircle className="w-8 h-8 text-[oklch(0.75_0.03_255)]" />
                  <p className="text-sm text-[oklch(0.55_0.03_255)]">
                    No messages yet. Say hi to {activeUser.name}!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
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
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            {!isActorReady ? (
              <div
                data-ocid="chat.connecting.loading_state"
                className="bg-white border-t border-[oklch(0.92_0.015_250)] p-4 flex items-center justify-center gap-2 text-[oklch(0.55_0.03_255)]"
              >
                <Wifi className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Connecting to server...</span>
              </div>
            ) : isFriend ? (
              <form
                onSubmit={handleSend}
                className="bg-white border-t border-[oklch(0.92_0.015_250)] p-3 flex gap-2"
              >
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${activeUser.name}...`}
                  data-ocid="chat.message.input"
                  className="flex-1 rounded-xl border-[oklch(0.9_0.015_250)] focus-visible:ring-[oklch(0.42_0.18_265)] h-10"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  disabled={!inputText.trim()}
                  data-ocid="chat.message.submit_button"
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
          <div
            data-ocid="chat.conversation.empty_state"
            className="flex-1 flex flex-col items-center justify-center gap-4 p-8"
          >
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
                data-ocid="chat.goto_directory.link"
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
